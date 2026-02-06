import { v4 as uuid } from 'uuid';
import type {
  IComicRepository,
  Item,
  Tag,
  Image,
  ListOptions,
  ImageInput,
  StorageInfo,
  ExportData,
} from '@comic-catalog/core';
import { createExportZip, parseImportZip } from '@comic-catalog/utils';
import { db } from './db';

export class WebRepository implements IComicRepository {
  async listItems(
    options?: ListOptions,
  ): Promise<{ items: Item[]; total: number }> {
    let collection = db.items.toCollection();
    let allItems = await collection.toArray();

    // Apply search
    if (options?.search) {
      const q = options.search.toLowerCase();
      allItems = allItems.filter(
        (item) =>
          item.series.toLowerCase().includes(q) ||
          item.issueNumber.toLowerCase().includes(q) ||
          (item.publisher && item.publisher.toLowerCase().includes(q)) ||
          (item.writers && item.writers.toLowerCase().includes(q)) ||
          (item.artists && item.artists.toLowerCase().includes(q)),
      );
    }

    // Apply filters
    if (options?.filters) {
      const f = options.filters;
      if (f.series) {
        allItems = allItems.filter((i) => i.series === f.series);
      }
      if (f.publisher) {
        allItems = allItems.filter((i) => i.publisher === f.publisher);
      }
      if (f.location) {
        allItems = allItems.filter((i) => i.location === f.location);
      }
      if (f.missingCover) {
        allItems = allItems.filter((i) => !i.coverImageId);
      }
      if (f.missingBarcode) {
        allItems = allItems.filter((i) => !i.barcode);
      }
      if (f.tags && f.tags.length > 0) {
        const taggedItemIds = new Set<string>();
        for (const tagId of f.tags) {
          const relations = await db.itemTags.where('tagId').equals(tagId).toArray();
          relations.forEach((r) => taggedItemIds.add(r.itemId));
        }
        allItems = allItems.filter((i) => taggedItemIds.has(i.id));
      }
    }

    // Sort by updatedAt desc
    allItems.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const total = allItems.length;
    const cursor = options?.cursor ?? 0;
    const limit = options?.limit ?? 50;
    const paged = allItems.slice(cursor, cursor + limit);

    return { items: paged as Item[], total };
  }

  async getItem(id: string): Promise<Item | null> {
    const item = await db.items.get(id);
    return (item as Item) ?? null;
  }

  async upsertItem(
    input: Partial<Item> & { series: string; issueNumber: string },
  ): Promise<Item> {
    const now = new Date().toISOString();
    const existing = input.id ? await db.items.get(input.id) : null;

    const item: Item = {
      id: existing?.id ?? input.id ?? uuid(),
      series: input.series,
      issueNumber: input.issueNumber,
      variant: input.variant ?? existing?.variant ?? null,
      publisher: input.publisher ?? existing?.publisher ?? null,
      releaseDate: input.releaseDate ?? existing?.releaseDate ?? null,
      writers: input.writers ?? existing?.writers ?? '',
      artists: input.artists ?? existing?.artists ?? '',
      condition: input.condition ?? existing?.condition ?? null,
      purchasePrice: input.purchasePrice ?? existing?.purchasePrice ?? null,
      location: input.location ?? existing?.location ?? null,
      notes: input.notes ?? existing?.notes ?? null,
      barcode: input.barcode ?? existing?.barcode ?? null,
      coverImageId: input.coverImageId ?? existing?.coverImageId ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.items.put(item);
    return item;
  }

  async deleteItem(id: string): Promise<void> {
    const item = await db.items.get(id);
    if (item?.coverImageId) {
      await db.images.delete(item.coverImageId);
      await db.imageBlobs.delete(item.coverImageId);
    }
    await db.itemTags.where('itemId').equals(id).delete();
    await db.items.delete(id);
  }

  async findItemByBarcode(barcode: string): Promise<Item | null> {
    const item = await db.items.where('barcode').equals(barcode).first();
    return (item as Item) ?? null;
  }

  async listTags(): Promise<Tag[]> {
    return (await db.tags.toArray()) as Tag[];
  }

  async upsertTag(name: string): Promise<Tag> {
    const existing = await db.tags.where('name').equals(name).first();
    if (existing) return existing as Tag;
    const tag: Tag = { id: uuid(), name };
    await db.tags.add(tag);
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await db.itemTags.where('tagId').equals(id).delete();
    await db.tags.delete(id);
  }

  async setItemTags(itemId: string, tagIds: string[]): Promise<void> {
    await db.itemTags.where('itemId').equals(itemId).delete();
    const entries = tagIds.map((tagId) => ({ itemId, tagId }));
    if (entries.length > 0) {
      await db.itemTags.bulkAdd(entries);
    }
  }

  async getItemTags(itemId: string): Promise<Tag[]> {
    const relations = await db.itemTags.where('itemId').equals(itemId).toArray();
    const tagIds = relations.map((r) => r.tagId);
    if (tagIds.length === 0) return [];
    const tags = await db.tags.where('id').anyOf(tagIds).toArray();
    return tags as Tag[];
  }

  async attachCoverImage(itemId: string, input: ImageInput): Promise<Image> {
    // Remove old cover if exists
    const item = await db.items.get(itemId);
    if (item?.coverImageId) {
      await db.images.delete(item.coverImageId);
      await db.imageBlobs.delete(item.coverImageId);
    }

    const imageId = uuid();
    const now = new Date().toISOString();
    const image: Image = {
      id: imageId,
      kind: 'cover',
      platformRef: `blob:${imageId}`,
      mime: input.mime,
      width: input.width ?? null,
      height: input.height ?? null,
      createdAt: now,
    };

    const blob = new Blob([input.data.buffer as ArrayBuffer], { type: input.mime });
    await db.images.add(image);
    await db.imageBlobs.add({ id: imageId, data: blob });
    await db.items.update(itemId, { coverImageId: imageId, updatedAt: now });

    return image;
  }

  async getImage(id: string): Promise<Image | null> {
    const image = await db.images.get(id);
    return (image as Image) ?? null;
  }

  async getImageData(image: Image): Promise<Uint8Array | null> {
    const record = await db.imageBlobs.get(image.id);
    if (!record) return null;
    const arrayBuf = await record.data.arrayBuffer();
    return new Uint8Array(arrayBuf);
  }

  async getImageUrl(image: Image): Promise<string | null> {
    const record = await db.imageBlobs.get(image.id);
    if (!record) return null;
    return URL.createObjectURL(record.data);
  }

  async deleteCoverImage(itemId: string): Promise<void> {
    const item = await db.items.get(itemId);
    if (!item?.coverImageId) return;
    await db.images.delete(item.coverImageId);
    await db.imageBlobs.delete(item.coverImageId);
    await db.items.update(itemId, {
      coverImageId: null,
      updatedAt: new Date().toISOString(),
    });
  }

  async exportBackup(): Promise<Uint8Array> {
    const items = (await db.items.toArray()) as Item[];
    const tags = (await db.tags.toArray()) as Tag[];
    const itemTags = await db.itemTags.toArray();
    const images = (await db.images.toArray()) as Image[];

    const exportData: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
      tags,
      itemTags,
      images,
    };

    return createExportZip(exportData, async (platformRef) => {
      const imageId = platformRef.replace('blob:', '');
      const record = await db.imageBlobs.get(imageId);
      if (!record) return null;
      const buf = await record.data.arrayBuffer();
      return new Uint8Array(buf);
    });
  }

  async importBackup(zipBytes: Uint8Array): Promise<void> {
    const { data, images: imageDataMap } = await parseImportZip(zipBytes);

    // Wipe existing data
    await db.items.clear();
    await db.tags.clear();
    await db.itemTags.clear();
    await db.images.clear();
    await db.imageBlobs.clear();

    // Restore tags
    if (data.tags.length > 0) {
      await db.tags.bulkAdd(data.tags);
    }

    // Restore items
    if (data.items.length > 0) {
      await db.items.bulkAdd(data.items);
    }

    // Restore item_tags
    if (data.itemTags.length > 0) {
      await db.itemTags.bulkAdd(data.itemTags);
    }

    // Restore images
    for (const image of data.images) {
      await db.images.add(image);
      const imageData = imageDataMap.get(image.id);
      if (imageData) {
        const blob = new Blob([imageData.buffer as ArrayBuffer], { type: image.mime });
        await db.imageBlobs.add({ id: image.id, data: blob });
      }
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    const itemCount = await db.items.count();
    const tagCount = await db.tags.count();
    const imageCount = await db.images.count();

    let estimatedSizeBytes: number | undefined;
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      estimatedSizeBytes = estimate.usage;
    }

    return { itemCount, tagCount, imageCount, estimatedSizeBytes };
  }

  async getDistinctSeries(): Promise<string[]> {
    const items = await db.items.toArray();
    const set = new Set(items.map((i) => i.series).filter(Boolean));
    return Array.from(set).sort();
  }

  async getDistinctPublishers(): Promise<string[]> {
    const items = await db.items.toArray();
    const set = new Set(items.map((i) => i.publisher).filter((p): p is string => !!p));
    return Array.from(set).sort();
  }

  async getDistinctLocations(): Promise<string[]> {
    const items = await db.items.toArray();
    const set = new Set(items.map((i) => i.location).filter((l): l is string => !!l));
    return Array.from(set).sort();
  }
}
