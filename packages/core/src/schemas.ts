import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().uuid(),
  series: z.string().min(1, 'Series is required'),
  issueNumber: z.string().min(1, 'Issue number is required'),
  variant: z.string().nullable().default(null),
  publisher: z.string().nullable().default(null),
  releaseDate: z.string().nullable().default(null),
  writers: z.string().default(''),
  artists: z.string().default(''),
  condition: z.string().nullable().default(null),
  purchasePrice: z.number().nullable().default(null),
  location: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  barcode: z.string().nullable().default(null),
  coverImageId: z.string().uuid().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Item = z.infer<typeof ItemSchema>;

export const ItemCreateSchema = ItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  coverImageId: true,
});

export type ItemCreate = z.infer<typeof ItemCreateSchema>;

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Tag name is required'),
});

export type Tag = z.infer<typeof TagSchema>;

export const ItemTagSchema = z.object({
  itemId: z.string().uuid(),
  tagId: z.string().uuid(),
});

export type ItemTag = z.infer<typeof ItemTagSchema>;

export const ImageSchema = z.object({
  id: z.string().uuid(),
  kind: z.literal('cover'),
  platformRef: z.string(),
  mime: z.string(),
  width: z.number().nullable().default(null),
  height: z.number().nullable().default(null),
  createdAt: z.string(),
});

export type Image = z.infer<typeof ImageSchema>;

export const ConditionOptions = [
  'Mint',
  'Near Mint',
  'Very Fine',
  'Fine',
  'Very Good',
  'Good',
  'Fair',
  'Poor',
] as const;

export type Condition = (typeof ConditionOptions)[number];

export const ViewMode = z.enum(['grid', 'list']);
export type ViewMode = z.infer<typeof ViewMode>;

export interface ListFilters {
  series?: string;
  publisher?: string;
  tags?: string[];
  location?: string;
  missingCover?: boolean;
  missingBarcode?: boolean;
}

export interface ListOptions {
  view?: ViewMode;
  search?: string;
  filters?: ListFilters;
  cursor?: number;
  limit?: number;
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  items: Item[];
  tags: Tag[];
  itemTags: ItemTag[];
  images: Image[];
}
