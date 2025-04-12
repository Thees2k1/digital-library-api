import { PagingOptions } from '@src/core/types';
import {
  BooksFilter,
  BooksSortOptions,
  ReviewCreateDto,
  ReviewListResultDto,
  UpdateReadingDto,
} from '../../application/dtos/book-dto';
import { BookEntity } from '../entities/book-entity';
import { BookReading } from '../entities/book-reading';

export interface GetListResult {
  books: Array<BookEntity>;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export abstract class BookRepository {
  abstract getList(
    paging: PagingOptions | undefined,
    filter: BooksFilter | undefined,
    sort: BooksSortOptions | undefined,
  ): Promise<GetListResult>;
  abstract getById(id: string): Promise<BookEntity | null>;
  abstract create(data: Partial<BookEntity>): Promise<BookEntity>;
  abstract update(id: string, data: Partial<BookEntity>): Promise<void>;
  abstract delete(id: string, performHardDelete: boolean): Promise<void>;

  abstract getByTitleAsync(title: string): Promise<BookEntity | null>;

  abstract updateBookGenres(
    genres: Array<string>,
    bookId: string,
  ): Promise<void>;

  abstract addBookDigitalItem(
    itemData: object,
    bookId: string,
  ): Promise<object>;

  abstract addReview(data: ReviewCreateDto): Promise<void>;

  abstract getReviews(
    bookId: string,
    page: number,
    limit: number,
  ): Promise<ReviewListResultDto>;

  abstract count(filter: BooksFilter | undefined): Promise<number>;

  abstract setLikeStatus(
    userId: string,
    bookId: string,
    status: 'liked' | 'unliked',
  ): Promise<void>;

  abstract getLikeStatus(
    userId: string,
    bookId: string,
  ): Promise<'liked' | 'unliked' | null>;

  abstract getLikeCount(bookId: string): Promise<number>;

  abstract getAllBooks(): Promise<Array<BookEntity>>;

  abstract getUserLikeList(userId: string): Promise<Array<string>>;

  abstract getReadingList(userId: string): Promise<Array<BookReading>>;

  abstract getReading(
    userId: string,
    bookId: string,
  ): Promise<BookReading | null>;

  abstract createReading(
    userId: string,
    bookId: string,
    data: BookReading,
  ): Promise<void>;

  abstract updateReading(
    userId: string,
    bookId: string,
    data: UpdateReadingDto,
  ): Promise<void>;

  abstract getFavoriteBooks(userId: string): Promise<Array<BookEntity>>;

  abstract updateFavorite(
    userId: string,
    bookId: string,
    isFavorite: boolean,
  ): Promise<void>;

  abstract getPopularBooks(limit: number): Promise<BookEntity[]>;

  abstract getAll(): Promise<Array<BookEntity>>;
  abstract updatePopularityScore(bookId: string, score: number): Promise<void>;
}
