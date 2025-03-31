import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';
import {
  GetListOptions,
  idSchema,
  PagingMetadata,
  SortOptions,
  sortOrderSchema,
} from '@src/core/types';
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

export const genreSortFieldsSchema = z
  .enum(['name', 'createdAt', 'updatedAt'])
  .default('createdAt');

export const genresQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      const parsed = parseInt(arg, 10);
      return isNaN(parsed) ? undefined : parsed; // Return `undefined` if parsing fails
    }
    return arg;
  }, z.number().optional()),
  cursor: z.string().optional(),
  sort: genreSortFieldsSchema.optional(),
  order: sortOrderSchema.optional(),
});

export type GenreCreateDto = z.infer<typeof genreCreateSchema>;

export type GenreUpdateDto = z.infer<typeof genreUpdateSchema>;

export type GenreDetailDto = z.infer<typeof genreDetailSchema>;

export type GenreList = Array<GenreDetailDto>;

export type GenresQuery = z.infer<typeof genresQuerySchema>;

export type GenreFilters = {
  name?: string;
};
export type GenreSortFields = z.infer<typeof genreSortFieldsSchema>;

export type GenreSortOptions = SortOptions<GenreSortFields>;
export type GetGenresOptions = GetListOptions<GenreFilters, GenreSortOptions>;

export type GetGenresResult = {
  data: GenreList;
  paging: PagingMetadata;
};
