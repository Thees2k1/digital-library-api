import { GetListOptions, SortOptions, sortOrderSchema } from '@src/core/types';
import { z } from 'zod';

export const AuthorCreateSchema = z.object({
  name: z.string().min(1).max(255),
  avatar: z.string().optional(),
  birthDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date()),
  deathDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      return arg ? new Date(arg) : null;
    }
    return arg;
  }, z.date().nullable().optional()),
  country: z.string().min(1).max(255).optional(),
  bio: z.string().optional(),
});

export const AuthorCreateResultSchema = AuthorCreateSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuthorSort = z
  .enum(['id', 'name', 'createdAt', 'updatedAt', 'popularityPoints'])
  .default('createdAt');

export const AuthorsQuerySchema = z.object({
  sort: AuthorSort.optional(),
  order: sortOrderSchema.optional(),
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      const parsed = parseInt(arg, 10);
      return isNaN(parsed) ? undefined : parsed; // Return `undefined` if parsing fails
    }
    return arg;
  }, z.number().optional()),
  country: z.string().optional(),
});

export const AuthorUpdateSchema = AuthorCreateSchema.partial();

export const AuthorIdResultSchema = z.string().uuid();

export type AuthorSortFields = z.infer<typeof AuthorSort>;
export type AuthorsQuery = z.infer<typeof AuthorsQuerySchema>;
export interface AuthorCreateDto extends z.infer<typeof AuthorCreateSchema> {}
export interface AuthorUpdateDto extends z.infer<typeof AuthorUpdateSchema> {}

export interface AuthorCreateResultDto
  extends z.infer<typeof AuthorCreateResultSchema> {}
export type AuthorIdResultDto = z.infer<typeof AuthorIdResultSchema>;
export type AuthorUpdateResultDto = AuthorIdResultDto;
export type AuthorDeleteResultDto = AuthorIdResultDto;

export interface AuthorDetailDto {
  id: string;
  name: string;
  avatar: string | null;
  country: string;
  birthDate: Date;
  deathDate: Date | null;
  age: number;
  bio: string;
  bookCount: number;
}

export interface AuthorList extends Array<AuthorDetailDto> {}

export type AuthorFilter = {
  name?: string;
  country?: string;
};
export type AuthorSortOptions = SortOptions<AuthorSortFields>;
export type GetAuthorsOptions = GetListOptions<AuthorFilter, AuthorSortOptions>;

export type GetAuthorsResult = {
  data: AuthorList;
  total?: number;
  limit: number;
  nextCursor?: string;
  hasNextPage: boolean;
};
