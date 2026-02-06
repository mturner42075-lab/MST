import Dexie, { type EntityTable } from 'dexie';

export interface DbItem {
  id: string;
  series: string;
  issueNumber: string;
  variant: string | null;
  publisher: string | null;
  releaseDate: string | null;
  writers: string;
  artists: string;
  condition: string | null;
  purchasePrice: number | null;
  location: string | null;
  notes: string | null;
  barcode: string | null;
  coverImageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbTag {
  id: string;
  name: string;
}

export interface DbItemTag {
  itemId: string;
  tagId: string;
}

export interface DbImage {
  id: string;
  kind: 'cover';
  platformRef: string;
  mime: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface DbImageBlob {
  id: string;
  data: Blob;
}

class ComicCatalogDB extends Dexie {
  items!: EntityTable<DbItem, 'id'>;
  tags!: EntityTable<DbTag, 'id'>;
  itemTags!: EntityTable<DbItemTag, 'itemId'>;
  images!: EntityTable<DbImage, 'id'>;
  imageBlobs!: EntityTable<DbImageBlob, 'id'>;

  constructor() {
    super('comic-catalog');
    this.version(1).stores({
      items: 'id, series, publisher, barcode, updatedAt',
      tags: 'id, &name',
      itemTags: '[itemId+tagId], itemId, tagId',
      images: 'id',
      imageBlobs: 'id',
    });
  }
}

export const db = new ComicCatalogDB();
