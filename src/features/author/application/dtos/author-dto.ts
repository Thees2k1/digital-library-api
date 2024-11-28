import { z } from 'zod';

export const AuthorCreateSchema = z.object({
  name: z.string().min(1).max(255),
  birthdate: z.date(),
  bio: z.string().min(1).max(255),
});

export const AuthorCreateResultSchema = AuthorCreateSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AuthorUpdateSchema = AuthorCreateSchema.partial();

export const AuthorIdSchema = z.string().uuid();

export const AuthorIdResultSchema = z.string().uuid();

export interface AuthorCreateDto extends z.infer<typeof AuthorCreateSchema> {}
export interface AuthorUpdateDto extends z.infer<typeof AuthorUpdateSchema> {}
export type AuthorIdDto = z.infer<typeof AuthorIdSchema>;

export interface AuthorCreateResultDto
  extends z.infer<typeof AuthorCreateResultSchema> {}
export type AuthorIdResultDto = z.infer<typeof AuthorIdResultSchema>;
export type AuthorUpdateResultDto = AuthorIdResultDto;
export type AuthorDeleteResultDto = AuthorIdResultDto;

export interface AuthorDetailDto {
  id: string;
  name: string;
  birthdate: Date;
  age: number;
  bio: string;
  bookCount: number;
}

export type AuthorList = AuthorDetailDto[];
