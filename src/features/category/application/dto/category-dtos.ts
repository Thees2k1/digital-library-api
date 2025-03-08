import { GetListOptions, PagingOptions } from '@src/core/types';
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

export type GetCategoriesParams = GetListOptions<any>;

export type GetCategoriesResult = {
  data: Array<CategoryDetailDto>;
  total?: number;
  nextCursor?: string;
  hasNextPage: boolean;
};
