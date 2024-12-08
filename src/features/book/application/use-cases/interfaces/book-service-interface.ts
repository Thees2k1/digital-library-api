import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  BookCreateDto,
  BookDetailDto,
  BookListQueryDto,
  BookListResultDto,
  BookUpdateDto,
} from '../../dtos/book-dto';

export interface IBookService {
  getList(query: BookListQueryDto): Promise<BookListResultDto>;
  create(data: BookCreateDto): Promise<BookDetailDto>;
  update(id: Id, data: BookUpdateDto): Promise<string>;
  getById(id: string): Promise<BookDetailDto | null>;
  delete(id: string): Promise<string>;
}
