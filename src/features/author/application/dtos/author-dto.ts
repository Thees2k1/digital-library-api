import { GetListOptions } from '@src/core/types';
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

export const AuthorUpdateSchema = AuthorCreateSchema.partial();

export const AuthorIdResultSchema = z.string().uuid();

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

export type GetAuthorsParams = GetListOptions<any>;

export type GetAuthorsResult = {
  data: AuthorList;
  total?: number;
  limit: number;
  nextCursor?: string;
  hasNextPage: boolean;
};
