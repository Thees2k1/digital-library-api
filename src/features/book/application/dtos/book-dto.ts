import { idSchema, isoDateStringShema } from '@src/core/types';
import { z } from 'zod';
import { ItemFormat } from '../../domain/interfaces/models';

export const digitalItemDtoSchema = z.object({
  id: z.string().uuid().optional(),
  format: z.nativeEnum(ItemFormat),
  url: z.string().min(1).max(255),
  size: z.number().int().positive().optional().nullable(),
});

export const bookCreateDtoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string(),
  cover: z.string().min(1).max(255),
  releaseDate: isoDateStringShema,
  authorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  publisherId: z.string().uuid().optional().nullable(),
  language: z.string().min(1).max(255).optional(),
  pages: z.number().int().positive().optional().nullable(),
  genres: z.array(z.string().uuid()),
  digitalItems: z.array(digitalItemDtoSchema),
});

export const bookUpdateDtoSchema = bookCreateDtoSchema.partial();

export const bookDetailDtoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  cover: z.string().min(1).max(255),
  description: z.string(),
  language: z.string().min(1).max(255).nullable(),
  pages: z.number().int().positive().nullable(),
  author: z.object({
    id: z.string().uuid(),
    name: z.string().max(255),
  }),
  publisher: z
    .object({
      id: z.string().uuid(),
      name: z.string().max(255),
    })
    .nullable(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string().max(255),
  }),
  genres: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(255),
    }),
  ),
  digitalItems: z.array(
    z.object({
      id: z.string().uuid(),
      format: z.string().min(1).max(255),
      url: z.string().min(1).max(255),
    }),
  ),
  reviewCount: z.number().optional(),
  averageRating: z.number().optional(),
  likeCount: z.number().optional(),
  releaseDate: isoDateStringShema,
  updateAt: isoDateStringShema,
});

export const bookListQueryDtoSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val!, 10))
    .refine((val) => val > 0, {
      message: 'Page must be a positive integer',
    })
    .default('1'),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val!, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be a positive integer and no more than 100',
    })
    .default('10'),
  authorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  publisherId: z.string().uuid().optional(),
  genres: z
    .preprocess((arg) => {
      if (typeof arg === 'string') {
        return [arg];
      } else if (Array.isArray(arg)) {
        return arg;
      }
      return undefined;
    }, z.array(z.string().uuid()))
    .optional(),
});

export const reviewCreateDtoSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const reviewDetailDtoSchema = z.object({
  id: z.string().uuid(),
  bookId: idSchema,
  userId: idSchema,
  username: z.string(),
  rating: z.number().int(),
  comment: z.string().nullable(),
  createdAt: isoDateStringShema,
});

export type BookCreateDto = z.infer<typeof bookCreateDtoSchema>;
export type BookUpdateDto = z.infer<typeof bookUpdateDtoSchema>;
export type BookDetailDto = z.infer<typeof bookDetailDtoSchema>;
export type BookListQueryDto = z.infer<typeof bookListQueryDtoSchema>;

export type BookListResultDto = {
  data: BookDetailDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ReviewCreateDto = z.infer<typeof reviewCreateDtoSchema> & {
  bookId: string;
  userId: string;
};
export type ReviewDetailDto = z.infer<typeof reviewDetailDtoSchema>;
