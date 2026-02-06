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

/**
 * SQLite-based repository for mobile (expo-sqlite) and desktop (Tauri SQLite).
 * Accepts a generic db executor so it can work with different SQLite bindings.
 */
export interface SQLiteExecutor {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  readFile(path: string): Promise<Uint8Array | null>;
  writeFile(path: string, data: Uint8Array): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getAppDataDir(): Promise<string>;
}

export class SQLiteRepository implements IComicRepository {
  constructor(private db: SQLiteExecutor) {}

  async initialize(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        series TEXT NOT NULL,
        issueNumber TEXT NOT NULL,
        variant TEXT,
        publisher TEXT,
        releaseDate TEXT,
        writers TEXT DEFAULT '',
        artists TEXT DEFAULT '',
        condition TEXT,
        purchasePrice REAL,
        location TEXT,
        notes TEXT,
        barcode TEXT,
        coverImageId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);
    await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode)`);
    await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_items_series ON items(series)`);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS item_tags (
        itemId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        PRIMARY KEY (itemId, tagId)
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL DEFAULT 'cover',
        platformRef TEXT NOT NULL,
        mime TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        createdAt TEXT NOT NULL
      )
    `);
  }

  async listItems(
    options?: ListOptions,
  ): Promise<{ items: Item[]; total: number }> {
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params: unknown[] = [];

    if (options?.search) {
      sql +=
        ' AND (series LIKE ? OR issueNumber LIKE ? OR publisher LIKE ? OR writers LIKE ? OR artists LIKE ?)';
      const q = `%${options.search}%`;
      params.push(q, q, q, q, q);
    }

    if (options?.filters) {
      const f = options.filters;
      if (f.series) {
        sql += ' AND series = ?';
        params.push(f.series);
      }
      if (f.publisher) {
        sql += ' AND publisher = ?';
        params.push(f.publisher);
      }
      if (f.location) {
        sql += ' AND location = ?';
        params.push(f.location);
      }
      if (f.missingCover) {
        sql += ' AND coverImageId IS NULL';
      }
      if (f.missingBarcode) {
        sql += ' AND (barcode IS NULL OR barcode = "")';
      }
      if (f.tags && f.tags.length > 0) {
        const placeholders = f.tags.map(() => '?').join(',');
        sql += ` AND id IN (SELECT itemId FROM item_tags WHERE tagId IN (${placeholders}))`;
        params.push(...f.tags);
      }
    }

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as cnt');
    const countResult = await this.db.query<{ cnt: number }>(countSql, params);
    const total = countResult[0]?.cnt ?? 0;

    sql += ' ORDER BY updatedAt DESC';

    const limit = options?.limit ?? 50;
    const cursor = options?.cursor ?? 0;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, cursor);

    const rows = await this.db.query<Item>(sql, params);
    return { items: rows, total };
  }

  async getItem(id: string): Promise<Item | null> {
    const rows = await this.db.query<Item>('SELECT * FROM items WHERE id = ?', [id]);
    return rows[0] ?? null;
  }

  async upsertItem(
    input: Partial<Item> & { series: string; issueNumber: string },
  ): Promise<Item> {
    const now = new Date().toISOString();
    const existing = input.id
      ? (await this.db.query<Item>('SELECT * FROM items WHERE id = ?', [input.id]))[0]
      : null;

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

    await this.db.execute(
      `INSERT OR REPLACE INTO items (id, series, issueNumber, variant, publisher, releaseDate,
        writers, artists, condition, purchasePrice, location, notes, barcode, coverImageId,
        createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id, item.series, item.issueNumber, item.variant, item.publisher,
        item.releaseDate, item.writers, item.artists, item.condition, item.purchasePrice,
        item.location, item.notes, item.barcode, item.coverImageId,
        item.createdAt, item.updatedAt,
      ],
    );

    return item;
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.getItem(id);
    if (item?.coverImageId) {
      await this.deleteCoverImage(id);
    }
    await this.db.execute('DELETE FROM item_tags WHERE itemId = ?', [id]);
    await this.db.execute('DELETE FROM items WHERE id = ?', [id]);
  }

  async findItemByBarcode(barcode: string): Promise<Item | null> {
    const rows = await this.db.query<Item>('SELECT * FROM items WHERE barcode = ?', [barcode]);
    return rows[0] ?? null;
  }

  async listTags(): Promise<Tag[]> {
    return this.db.query<Tag>('SELECT * FROM tags ORDER BY name');
  }

  async upsertTag(name: string): Promise<Tag> {
    const existing = await this.db.query<Tag>('SELECT * FROM tags WHERE name = ?', [name]);
    if (existing[0]) return existing[0];
    const tag: Tag = { id: uuid(), name };
    await this.db.execute('INSERT INTO tags (id, name) VALUES (?, ?)', [tag.id, tag.name]);
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await this.db.execute('DELETE FROM item_tags WHERE tagId = ?', [id]);
    await this.db.execute('DELETE FROM tags WHERE id = ?', [id]);
  }

  async setItemTags(itemId: string, tagIds: string[]): Promise<void> {
    await this.db.execute('DELETE FROM item_tags WHERE itemId = ?', [itemId]);
    for (const tagId of tagIds) {
      await this.db.execute('INSERT INTO item_tags (itemId, tagId) VALUES (?, ?)', [
        itemId,
        tagId,
      ]);
    }
  }

  async getItemTags(itemId: string): Promise<Tag[]> {
    return this.db.query<Tag>(
      'SELECT t.* FROM tags t INNER JOIN item_tags it ON t.id = it.tagId WHERE it.itemId = ?',
      [itemId],
    );
  }

  async attachCoverImage(itemId: string, input: ImageInput): Promise<Image> {
    const item = await this.getItem(itemId);
    if (item?.coverImageId) {
      await this.deleteCoverImage(itemId);
    }

    const imageId = uuid();
    const now = new Date().toISOString();
    const appDir = await this.db.getAppDataDir();
    const ext = input.mime.split('/')[1] || 'jpg';
    const filePath = `${appDir}/images/${imageId}.${ext}`;

    const storedPath = await this.db.writeFile(filePath, input.data);

    const image: Image = {
      id: imageId,
      kind: 'cover',
      platformRef: storedPath,
      mime: input.mime,
      width: input.width ?? null,
      height: input.height ?? null,
      createdAt: now,
    };

    await this.db.execute(
      'INSERT INTO images (id, kind, platformRef, mime, width, height, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [image.id, image.kind, image.platformRef, image.mime, image.width, image.height, image.createdAt],
    );

    await this.db.execute('UPDATE items SET coverImageId = ?, updatedAt = ? WHERE id = ?', [
      imageId, now, itemId,
    ]);

    return image;
  }

  async getImage(id: string): Promise<Image | null> {
    const rows = await this.db.query<Image>('SELECT * FROM images WHERE id = ?', [id]);
    return rows[0] ?? null;
  }

  async getImageData(image: Image): Promise<Uint8Array | null> {
    return this.db.readFile(image.platformRef);
  }

  getImageUrl(image: Image): string {
    return image.platformRef;
  }

  async deleteCoverImage(itemId: string): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item?.coverImageId) return;

    const image = await this.getImage(item.coverImageId);
    if (image) {
      try {
        await this.db.deleteFile(image.platformRef);
      } catch {
        // File might not exist
      }
      await this.db.execute('DELETE FROM images WHERE id = ?', [image.id]);
    }
    await this.db.execute('UPDATE items SET coverImageId = NULL, updatedAt = ? WHERE id = ?', [
      new Date().toISOString(), itemId,
    ]);
  }

  async exportBackup(): Promise<Uint8Array> {
    const items = await this.db.query<Item>('SELECT * FROM items');
    const tags = await this.db.query<Tag>('SELECT * FROM tags');
    const itemTags = await this.db.query<{ itemId: string; tagId: string }>('SELECT * FROM item_tags');
    const images = await this.db.query<Image>('SELECT * FROM images');

    const exportData: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
      tags,
      itemTags,
      images,
    };

    return createExportZip(exportData, async (platformRef) => {
      return this.db.readFile(platformRef);
    });
  }

  async importBackup(zipBytes: Uint8Array): Promise<void> {
    const { data, images: imageDataMap } = await parseImportZip(zipBytes);

    // Wipe existing
    await this.db.execute('DELETE FROM item_tags');
    await this.db.execute('DELETE FROM items');
    await this.db.execute('DELETE FROM tags');
    await this.db.execute('DELETE FROM images');

    // Restore tags
    for (const tag of data.tags) {
      await this.db.execute('INSERT INTO tags (id, name) VALUES (?, ?)', [tag.id, tag.name]);
    }

    // Restore items
    for (const item of data.items) {
      await this.db.execute(
        `INSERT INTO items (id, series, issueNumber, variant, publisher, releaseDate,
          writers, artists, condition, purchasePrice, location, notes, barcode, coverImageId,
          createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id, item.series, item.issueNumber, item.variant, item.publisher,
          item.releaseDate, item.writers, item.artists, item.condition, item.purchasePrice,
          item.location, item.notes, item.barcode, item.coverImageId,
          item.createdAt, item.updatedAt,
        ],
      );
    }

    // Restore item_tags
    for (const it of data.itemTags) {
      await this.db.execute('INSERT INTO item_tags (itemId, tagId) VALUES (?, ?)', [it.itemId, it.tagId]);
    }

    // Restore images
    const appDir = await this.db.getAppDataDir();
    for (const image of data.images) {
      const imageData = imageDataMap.get(image.id);
      let platformRef = image.platformRef;

      if (imageData) {
        const ext = image.mime.split('/')[1] || 'jpg';
        const filePath = `${appDir}/images/${image.id}.${ext}`;
        platformRef = await this.db.writeFile(filePath, imageData);
      }

      await this.db.execute(
        'INSERT INTO images (id, kind, platformRef, mime, width, height, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [image.id, image.kind, platformRef, image.mime, image.width, image.height, image.createdAt],
      );
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    const items = await this.db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM items');
    const tags = await this.db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM tags');
    const images = await this.db.query<{ cnt: number }>('SELECT COUNT(*) as cnt FROM images');

    return {
      itemCount: items[0]?.cnt ?? 0,
      tagCount: tags[0]?.cnt ?? 0,
      imageCount: images[0]?.cnt ?? 0,
    };
  }

  async getDistinctSeries(): Promise<string[]> {
    const rows = await this.db.query<{ series: string }>(
      'SELECT DISTINCT series FROM items WHERE series IS NOT NULL ORDER BY series',
    );
    return rows.map((r) => r.series);
  }

  async getDistinctPublishers(): Promise<string[]> {
    const rows = await this.db.query<{ publisher: string }>(
      'SELECT DISTINCT publisher FROM items WHERE publisher IS NOT NULL ORDER BY publisher',
    );
    return rows.map((r) => r.publisher);
  }

  async getDistinctLocations(): Promise<string[]> {
    const rows = await this.db.query<{ location: string }>(
      'SELECT DISTINCT location FROM items WHERE location IS NOT NULL ORDER BY location',
    );
    return rows.map((r) => r.location);
  }
}
