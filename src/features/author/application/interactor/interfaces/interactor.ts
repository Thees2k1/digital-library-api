import { Interactor } from '@src/core/interfaces/base-interactor';
import {
  AuthorCreateDto,
  AuthorDetailDto,
  AuthorIdDto,
  AuthorList,
  AuthorUpdateDto,
} from '../../dtos/author-dto';

export interface IAuthorInteractor
  extends Interactor<AuthorDetailDto, AuthorIdDto> {
  getList(): Promise<AuthorList>;
  getById(id: AuthorIdDto): Promise<AuthorDetailDto | null>;
  create(author: AuthorCreateDto): Promise<AuthorDetailDto>;
  update(id: string, author: AuthorUpdateDto): Promise<string>;
  delete(id: string): Promise<string>;
}
