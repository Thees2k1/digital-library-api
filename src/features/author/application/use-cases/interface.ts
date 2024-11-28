import {
  AuthorCreateDto,
  AuthorCreateResultDto,
  AuthorDeleteResultDto,
  AuthorDetailDto,
  AuthorIdDto,
  AuthorIdResultDto,
  AuthorList,
  AuthorUpdateDto,
  AuthorUpdateResultDto,
} from '../dtos/author-dto';

export interface IAuthorUseCases {
  getAuthors(): Promise<AuthorList>;
  getAuthorById(id: AuthorIdDto): Promise<AuthorDetailDto>;
  createAuthor(author: AuthorCreateDto): Promise<AuthorCreateResultDto>;
  updateAuthor(author: AuthorUpdateDto): Promise<AuthorIdResultDto>;
  deleteAuthor(id: string): Promise<AuthorIdResultDto>;
}

export interface IAuthorOutputPort {
  authorNotFound(): void;
  toAuthorDetailResult(author: AuthorEntity): AuthorDetailDto;
  toListAuthorResult(authors: AuthorEntity[]): AuthorList;
  toCreateResult(author: AuthorEntity): AuthorCreateResultDto;
  toUpdateResult(author: AuthorEntity): AuthorUpdateResultDto;
  toDeleteResult(id: string): AuthorDeleteResultDto;
}
