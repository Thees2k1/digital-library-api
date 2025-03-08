import { GetListOptions, idSchema, PagingMetadata } from '@src/core/types';
import { z } from 'zod';

export const genreCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
});

export const genreUpdateSchema = genreCreateSchema.partial();

export const genreDetailSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string().optional(),
  updatedAt: z.date().optional(),
});

export type GenreCreateDto = z.infer<typeof genreCreateSchema>;

export type GenreUpdateDto = z.infer<typeof genreUpdateSchema>;

export type GenreDetailDto = z.infer<typeof genreDetailSchema>;

export type GenreList = Array<GenreDetailDto>;

export type GetGenresParams = GetListOptions<any>;

export type GetGenresResult = {
  data: GenreList;
  paging: PagingMetadata;
};
