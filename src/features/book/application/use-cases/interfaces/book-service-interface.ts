import { Id } from '@src/core/types';
import {
  BookCreateDto,
  BookDetailDto,
  BookUpdateDto,
  GetListResult,
  ReviewCreateDto,
  ReviewListResultDto,
} from '../../dtos/book-dto';
import { GetListOptions } from './parameters';

export interface IBookService {
  //if the serivce only handle process between the  entity and the controller,
  // rather limit,offset. how about options search options ., and the data would be
  getList(options: GetListOptions): Promise<GetListResult>;
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
