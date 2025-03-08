import {
  GetListOptions,
  idSchema,
  isoDateStringShema,
  PagingMetadata,
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

export type SerieCreateDto = z.infer<typeof serieCreateSchema>;

export type SerieUpdateDto = z.infer<typeof serieUpdateSchema>;

export type SerieDetailDto = z.infer<typeof serieDetailSchema>;

export type SerieList = Array<SerieDetailDto>;

export type GetSeriesParams = GetListOptions<any>;

export type GetSeriesResult = {
  data: SerieList;
  paging: PagingMetadata;
};
