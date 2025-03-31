import {
  GetListOptions,
  idSchema,
  isoDateStringShema,
  PagingMetadata,
  SortOptions,
} from '@src/core/types';
import { z } from 'zod';

export const serieStatusSchema = z.enum([
  'completed',
  'ongoing',
  'archived',
  'planned',
  'deleted',
]);

export const serieCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  cover: z.string().optional().nullable(),
  books: z.array(idSchema),
  status: serieStatusSchema,
  releaseDate: isoDateStringShema,
});

export const serieUpdateSchema = serieCreateSchema.partial();

export const serieDetailSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string().nullable(),
  cover: z.string().nullable(),
  books: z.array(idSchema),
  status: serieStatusSchema,
  releaseDate: z.date().nullable(),
  updatedAt: z.date(),
});

export const serieStatus = z.enum([
  'completed',
  'ongoing',
  'archived',
  'planned',
  'deleted',
]);

export const serieSortFieldsSchema = z
  .enum(['name', 'createdAt', 'updatedAt'])
  .default('createdAt');
export const seriesQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      const parsed = parseInt(arg, 10);
      return isNaN(parsed) ? undefined : parsed; // Return `undefined` if parsing fails
    }
    return arg;
  }, z.number().optional()),
  status: serieStatus.default('ongoing'),
  releaseDate: z.string().optional(),
  cursor: z.string().optional(),
  sort: serieSortFieldsSchema.optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type SerieStatus = z.infer<typeof serieStatus>;

export type SerieSortFields = z.infer<typeof serieSortFieldsSchema>;

export type SerieCreateDto = z.infer<typeof serieCreateSchema>;

export type SerieUpdateDto = z.infer<typeof serieUpdateSchema>;

export type SerieDetailDto = z.infer<typeof serieDetailSchema>;

export type SerieList = Array<SerieDetailDto>;

export type SerieFilters = {
  name?: string;
  releaseDate?: string;
  status?: string;
  popularityPoints?: number;
};

export type SerieSortOptions = SortOptions<SerieSortFields>;

export type GetSeriesOptions = GetListOptions<SerieFilters, SerieSortOptions>;

export type GetSeriesResult = {
  data: SerieList;
  paging: PagingMetadata;
};
