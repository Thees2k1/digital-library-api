import {
  ReviewCreateDto,
  ReviewListResultDto,
} from '../../application/dtos/book-dto';
import {
  BooksFilter,
  PagingOptions,
  SortOptions,
} from '../../application/use-cases/interfaces/parameters';
import { BookEntity } from '../entities/book-entity';

export abstract class BookRepository {
  abstract getList(
    paging: PagingOptions | undefined,
    filter: BooksFilter | undefined,
    sort: SortOptions | undefined,
  ): Promise<BookEntity[]>;
  abstract getById(id: string): Promise<BookEntity | null>;
  abstract create(data: Partial<BookEntity>): Promise<BookEntity>;
  abstract update(id: string, data: Partial<BookEntity>): Promise<void>;
  abstract delete(id: string, performHardDelete: boolean): Promise<void>;

  abstract getByTitleAsync(title: string): Promise<BookEntity | null>;

  abstract updateBookGenres(genres: string[], bookId: string): Promise<void>;

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

  abstract getBookAuthor(bookId: string): Promise<object>;

  abstract getBookCategory(bookId: string): Promise<object>;

  abstract getBookGenres(bookId: string): Promise<object[]>;

  abstract getBookDigitalItems(bookId: string): Promise<object[]>;

  abstract getBookReviews(bookId: string): Promise<object[]>;

  abstract getReviewsCount(bookId: string): Promise<number>;

  abstract getAverageRating(bookId: string): Promise<number>;

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
}
