import { z } from 'zod';

export const idSchema = z.string().uuid();

export const categoryCreateSchema = z.object({
  name: z.string(),
  cover: z.string().optional(),
  description: z.string().optional(),
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