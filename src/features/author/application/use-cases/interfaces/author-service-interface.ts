import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  AuthorCreateDto,
  AuthorDetailDto,
  AuthorUpdateDto,
  GetAuthorsParams,
  GetAuthorsResult,
} from '../../dtos/author-dto';

export interface IAuthorService extends BaseUseCase<any, AuthorDetailDto, Id> {
  getList(params: GetAuthorsParams): Promise<GetAuthorsResult>;
  getById(id: Id): Promise<AuthorDetailDto | null>;
  create(author: AuthorCreateDto): Promise<AuthorDetailDto>;
  update(id: Id, author: AuthorUpdateDto): Promise<string>;
  delete(id: Id): Promise<string>;
  getPopularAuthors(limit: number, cursor?: string): Promise<GetAuthorsResult>;
}
