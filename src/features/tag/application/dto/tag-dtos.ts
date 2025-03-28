import { GetListOptions, idSchema, PagingMetadata } from '@src/core/types';
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

export type TagCreateDto = z.infer<typeof TagCreateSchema>;

export type TagUpdateDto = z.infer<typeof TagUpdateSchema>;

export type TagDetailDto = z.infer<typeof TagDetailSchema>;

export type TagList = Array<TagDetailDto>;

export type GetTagsParams = GetListOptions<any>;

export type GetTagsResult = {
  data: TagList;
  paging: PagingMetadata;
};
