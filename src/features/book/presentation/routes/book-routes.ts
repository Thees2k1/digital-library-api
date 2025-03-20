import { DI_TYPES } from '@src/core/di/types';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import {
  bookCreateDtoSchema,
  bookUpdateDtoSchema,
  reviewCreateDtoSchema,
} from '../../application/dtos/book-dto';
import { BookController } from '../controller/book-controller';

export class BookRoutes {
  static readonly books = '/books';
  static readonly search = '/books/search';
  static readonly book = '/books/:id';
  static readonly reviews = '/books/:id/reviews';
  static readonly like = '/books/:id/likes';
  static readonly userLikeList = '/books/liked-list';

  static readonly favorites = '/books/favorites';
  static readonly readingList = '/books/reading';
  static readonly reading = '/books/:id/reading';
}

@injectable()
export class BookRouterFactory extends BaseRouterFactory<BookController> {
  constructor(@inject(DI_TYPES.BookController) controller: BookController) {
    super(controller);
  }

  setupRoutes(): void {
    this._router.get(
      BookRoutes.books,
      this.controller.getBooks.bind(this.controller),
    );
    // this._router.get(BookRoutes.books, this.this.controller.getBooks);
    this._router.get(
      BookRoutes.search,
      this.controller.searchBooks.bind(this.controller),
    );
    this._router.get(
      BookRoutes.readingList,
      authMiddleware,
      this.controller.getReadingList.bind(this.controller),
    );
    this._router.get(
      BookRoutes.userLikeList,
      authMiddleware,
      this.controller.getUserLikeList.bind(this.controller),
    );
    this._router.get(
      BookRoutes.book,
      this.controller.getBook.bind(this.controller),
    );
    this._router.post(
      BookRoutes.books,
      authMiddleware,
      validationMiddleware(bookCreateDtoSchema),
      this.controller.createBook.bind(this.controller),
    );
    this._router.patch(
      BookRoutes.book,
      authMiddleware,
      validationMiddleware(bookUpdateDtoSchema),
      this.controller.updateBook.bind(this.controller),
    );

    this._router.delete(
      BookRoutes.book,
      authMiddleware,
      this.controller.deleteBook.bind(this.controller),
    );
    //reviews
    this._router.post(
      BookRoutes.reviews,
      authMiddleware,
      validationMiddleware(reviewCreateDtoSchema),
      this.controller.addReview.bind(this.controller),
    );
    this._router.get(
      BookRoutes.reviews,
      this.controller.getReviews.bind(this.controller),
    );

    //likes
    this._router.post(
      BookRoutes.like,
      authMiddleware,
      this.controller.toggleLike.bind(this.controller),
    );

    this._router.get(
      BookRoutes.like,
      this.controller.getLikeCount.bind(this.controller),
    );

    this._router.get(
      BookRoutes.reading,
      authMiddleware,
      this.controller.getReading.bind(this.controller),
    );

    this._router.post(
      BookRoutes.reading,
      authMiddleware,
      this.controller.updateReading.bind(this.controller),
    );

    // this._router.post(
    //   BookRoutes.readings,
    //   authMiddleware,
    //   this.controller.updateReading.bind(this.controller),
    // );

    // this._router.get(
    //   BookRoutes.favorites,
    //   authMiddleware,
    //   this.controller.getFavorites.bind(this.controller),
    // );

    // this._router.post(
    //   BookRoutes.favorites,
    //   authMiddleware,
    //   this.controller.addFavorite.bind(this.controller),
    // );

    // this._router.delete(
    //   BookRoutes.favorites,
    //   authMiddleware,
    //   this.controller.removeFavorite.bind(this.controller),
    // );
  }
  get routes(): Router {
    return this._router;
  }
}
