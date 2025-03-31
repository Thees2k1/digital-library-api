import {
  GetListOptions,
  idSchema,
  PagingMetadata,
  SortOptions,
  sortOrderSchema,
} from '@src/core/types';
import { z } from 'zod';

export const publisherCreateSchema = z.object({
  name: z.string(),
  cover: z.string().nullable(),
  contactInfo: z.string().nullable(),
  address: z.string().nullable(),
});

export const publisherUpdateSchema = publisherCreateSchema.partial();

export const publisherDetailSchema = publisherCreateSchema.extend({
  id: idSchema,
  name: z.string(),
  cover: z.string().nullable(),
  contactInfo: z.string().nullable(),
  address: z.string().nullable(),
  updatedAt: z.date().nullable(),
});

export const publisherListSchema = z.array(publisherDetailSchema);

export const publisherSortFieldsSchema = z
  .enum(['name', 'createdAt', 'updatedAt'])
  .default('createdAt');
export const publishersQuerySchema = z.object({
  q: z.string().optional(),
  limit: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      const parsed = parseInt(arg, 10);
      return isNaN(parsed) ? undefined : parsed; // Return `undefined` if parsing fails
    }
    return arg;
  }, z.number().optional()),
  cursor: z.string().optional(),
  sort: publisherSortFieldsSchema.optional(),
  order: sortOrderSchema.optional(),
});

export type PublisherSortFields = z.infer<typeof publisherSortFieldsSchema>;

export type PublisherCreateDto = z.infer<typeof publisherCreateSchema>;

export type PublisherUpdateDto = z.infer<typeof publisherUpdateSchema>;

export type PublisherDetailDto = z.infer<typeof publisherDetailSchema>;

export type PublisherList = z.infer<typeof publisherListSchema>;

export type PublisherFilters = {
  name?: string;
};

export type PublisherSortOptions = SortOptions<PublisherSortFields>;

export type GetPublishersOptions = GetListOptions<
  PublisherFilters,
  PublisherSortOptions
>;

export type GetPublishersResult = {
  data: PublisherList;
  paging: PagingMetadata;
};
