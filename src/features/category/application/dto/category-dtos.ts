import {
  GetListOptions,
  PagingOptions,
  SortOptions,
  sortOrderSchema,
} from '@src/core/types';
import { z } from 'zod';

export const idSchema = z.string().uuid();

export const categoryCreateSchema = z.object({
  name: z.string(),
  cover: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryDetailSchema = z.object({
  id: idSchema,
  name: z.string(),
  cover: z.string().optional(),
  description: z.string().optional(),
  updatedAt: z.date().optional(),
});

export type Id = z.infer<typeof idSchema>;

export type CategoryCreateDto = z.infer<typeof categoryCreateSchema>;

export type CategoryUpdateDto = z.infer<typeof categoryUpdateSchema>;

export type CategoryDetailDto = z.infer<typeof categoryDetailSchema>;

export type CategoryFilter = {
  name?: string;
};

export const categorySortSchema = z
  .enum(['id', 'name', 'createdAt', 'updatedAt', 'popularityPoints'])
  .default('createdAt');

export const categoryQuerySchema = z.object({
  sort: categorySortSchema.optional(),
  order: sortOrderSchema.optional(),
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      const parsed = parseInt(arg, 10);
      return isNaN(parsed) ? undefined : parsed; // Return `undefined` if parsing fails
    }
    return arg;
  }, z.number().optional()),
});
export type CategorySortFields = z.infer<typeof categorySortSchema>;

export type CategorySortOptions = SortOptions<CategorySortFields>;

export type GetCategoriesOptions = GetListOptions<
  CategoryFilter,
  CategorySortOptions
>;

export type GetCategoriesResult = {
  data: Array<CategoryDetailDto>;
  limit: number;
  total?: number;
  nextCursor?: string;
  hasNextPage: boolean;
};
