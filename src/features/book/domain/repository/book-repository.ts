import { BookEntity } from '../entities/book-entity';
import { Filter, Paging } from '../interfaces/common';

export abstract class BookRepository {
  abstract getList(
    paging: Paging | undefined,
    filter: Filter | undefined,
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

  abstract count(filter: Filter | undefined): Promise<number>;

  abstract getBookAuthor(bookId: string): Promise<object>;

  abstract getBookCategory(bookId: string): Promise<object>;

  abstract getBookGenres(bookId: string): Promise<object[]>;

  abstract getBookDigitalItems(bookId: string): Promise<object[]>;

  abstract getBookReviews(bookId: string): Promise<object[]>;

  abstract getReviewsCount(bookId: string): Promise<number>;

  abstract getAverageRating(bookId: string): Promise<number>;

  abstract getLikeCount(bookId: string): Promise<number>;
}
