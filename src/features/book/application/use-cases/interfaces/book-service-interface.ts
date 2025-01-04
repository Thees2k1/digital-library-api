import { Id } from '@src/core/types';
import {
  BookCreateDto,
  BookDetailDto,
  BookListQueryDto,
  BookListResultDto,
  BookUpdateDto,
  ReviewCreateDto,
  ReviewListResultDto,
} from '../../dtos/book-dto';

export interface IBookService {
  getList(query: BookListQueryDto): Promise<BookListResultDto>;
  create(data: BookCreateDto): Promise<BookDetailDto>;
  update(id: Id, data: BookUpdateDto): Promise<string>;
  getById(id: string): Promise<BookDetailDto | null>;
  delete(id: string): Promise<string>;
  addReview(review: ReviewCreateDto): Promise<string>;
  getReviews(
    bookId: string,
    page: number,
    limit: number,
  ): Promise<ReviewListResultDto>;
  toggleLike(userId: string, bookId: string): Promise<void>;
  getLikeCount(bookId: string): Promise<number>;
  search(query: string, page: number, limit: number): Promise<any>;
}
