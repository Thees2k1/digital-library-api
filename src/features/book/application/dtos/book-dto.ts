import { GetListOptions, idSchema, isoDateStringShema } from '@src/core/types';
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

export const bookListItemSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(255),
  cover: z.string().min(1).max(255),
  author: z.object({
    id: z.string().uuid(),
    name: z.string().max(255),
  }),
  desscription: z.string(),
  averageRating: z.number().optional(),
  createdAt: isoDateStringShema,
});

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
    avatar: z.string(),
    bio: z.string(),
  }),
  publisher: z.object({
    id: z.string().uuid().nullable(),
    name: z.string().max(255).nullable(),
  }),
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

export const reviewCreateDtoSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const reviewDetailDtoSchema = z.object({
  id: idSchema,
  bookId: idSchema,
  reviewer: z.object({
    id: idSchema,
    username: z.string(),
    avatar: z.string(),
  }),
  rating: z.number().int(),
  comment: z.string().nullable(),
  createdAt: isoDateStringShema,
});

export const bookQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20),
  q: z.string().optional(),
  genres: z.string().optional(),
  author: z.string().uuid().optional(),
  category: z.string().uuid().optional(),
  publisher: z.string().uuid().optional(),
  release_date_gte: z.coerce.number().int().optional(),
  release_date_lte: z.coerce.number().int().optional(),
  sort: z
    .enum([
      'releaseDate',
      '-releaseDate',
      'updatedAt',
      '-updatedAt',
      'id',
      '-id',
    ])
    .optional(),
});

export const bookListSchema = z.array(bookListItemSchema);

export type BookQuery = z.infer<typeof bookQuerySchema>;
export type BookListItem = z.infer<typeof bookListItemSchema>;
export type BookList = z.infer<typeof bookListSchema>;

export type GetListResult = {
  data: BookList;
  nextCursor: string;
  total: number;
  hasNextPage: boolean;
};

export type BookCreateDto = z.infer<typeof bookCreateDtoSchema>;
export type BookUpdateDto = z.infer<typeof bookUpdateDtoSchema>;
export type BookDetailDto = z.infer<typeof bookDetailDtoSchema>;
// export type BookListQueryDto = z.infer<typeof bookListQueryDtoSchema>;

export type BookIndexRecord = {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  rating: number;
  authorName: string;
  categoryName: string;
  genres: string[];
};

export type ReviewCreateDto = z.infer<typeof reviewCreateDtoSchema> & {
  bookId: string;
  userId: string;
};
export type ReviewDetailDto = z.infer<typeof reviewDetailDtoSchema>;

export type ReviewListResultDto = {
  data: ReviewDetailDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type BooksFilter = {
  query?: string;
  genres?: string[];
  authorId?: string;
  categoryId?: string;
  publisherId?: string;
  releaseDateRange?: {
    from: number;
    to: number;
  };
};

export type GetBooksOptions = GetListOptions<BooksFilter>;
