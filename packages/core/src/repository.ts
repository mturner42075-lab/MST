import type { Item, ItemCreate, Tag, Image, ListOptions, ExportData } from './schemas';

export interface ImageInput {
  data: Uint8Array;
  mime: string;
  width?: number;
  height?: number;
}

export interface StorageInfo {
  itemCount: number;
  tagCount: number;
  imageCount: number;
  estimatedSizeBytes?: number;
}

export interface IComicRepository {
  // Items
  listItems(options?: ListOptions): Promise<{ items: Item[]; total: number }>;
  getItem(id: string): Promise<Item | null>;
  upsertItem(item: Partial<Item> & { series: string; issueNumber: string }): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  findItemByBarcode(barcode: string): Promise<Item | null>;

  // Tags
  listTags(): Promise<Tag[]>;
  upsertTag(name: string): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  setItemTags(itemId: string, tagIds: string[]): Promise<void>;
  getItemTags(itemId: string): Promise<Tag[]>;

  // Images
  attachCoverImage(itemId: string, input: ImageInput): Promise<Image>;
  getImage(id: string): Promise<Image | null>;
  getImageData(image: Image): Promise<Uint8Array | null>;
  getImageUrl(image: Image): string | Promise<string | null>;
  deleteCoverImage(itemId: string): Promise<void>;

  // Import/Export
  exportBackup(): Promise<Uint8Array>;
  importBackup(zipBytes: Uint8Array): Promise<void>;

  // Storage Info
  getStorageInfo(): Promise<StorageInfo>;

  // Distinct values for filters
  getDistinctSeries(): Promise<string[]>;
  getDistinctPublishers(): Promise<string[]>;
  getDistinctLocations(): Promise<string[]>;
}
