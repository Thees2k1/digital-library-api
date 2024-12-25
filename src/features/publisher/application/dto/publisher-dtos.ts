import { idSchema } from '@src/core/types';
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
  updatedAt: z.date().nullable(),
});

export type PublisherCreateDto = z.infer<typeof publisherCreateSchema>;

export type PublisherUpdateDto = z.infer<typeof publisherUpdateSchema>;

export type PublisherDetailDto = z.infer<typeof publisherDetailSchema>;
