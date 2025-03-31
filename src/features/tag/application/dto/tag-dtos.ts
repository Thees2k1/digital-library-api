import {
  GetListOptions,
  idSchema,
  PagingMetadata,
  SortOptions,
  sortOrderSchema,
} from '@src/core/types';
import { z } from 'zod';

export const TagCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
});

export const TagUpdateSchema = TagCreateSchema.partial();

export const TagDetailSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string().optional(),
  updatedAt: z.date().optional(),
});

export const tagSortFieldsSchema = z
  .enum(['name', 'createdAt', 'updatedAt'])
  .default('createdAt');

export const tagsQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      const parsed = parseInt(arg, 10);
      return isNaN(parsed) ? undefined : parsed; // Return `undefined` if parsing fails
    }
    return arg;
  }, z.number().optional()),
  cursor: z.string().optional(),
  sort: tagSortFieldsSchema.optional(),
  order: sortOrderSchema.optional(),
});

export type TagSortFields = z.infer<typeof tagSortFieldsSchema>;

export type TagCreateDto = z.infer<typeof TagCreateSchema>;

export type TagUpdateDto = z.infer<typeof TagUpdateSchema>;

export type TagDetailDto = z.infer<typeof TagDetailSchema>;

export type TagList = Array<TagDetailDto>;

export type TagFilters = {
  name?: string;
};

export type TagSortOptions = SortOptions<TagSortFields>;

export type GetTagsOptions = GetListOptions<TagFilters, TagSortOptions>;

export type GetTagsResult = {
  data: TagList;
  paging: PagingMetadata;
};
