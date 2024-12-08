import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { Router } from 'express';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { BookController } from '../controller/book-controller';
import {
  bookCreateDtoSchema,
  bookUpdateDtoSchema,
} from '../../application/dtos/book-dto';

export class BookRouter {
  static get routes(): Router {
    const path = '/books';
    const router = Router();
    const controller = container.get<BookController>(DI_TYPES.BookController);
    router.get(path, controller.getBooks.bind(controller));
    router.get(`${path}/:id`, controller.getBook.bind(controller));
    router.post(
      path,
      authMiddleware,
      validationMiddleware(bookCreateDtoSchema),
      controller.createBook.bind(controller),
    );
    router.patch(
      `${path}/:id`,
      authMiddleware,
      validationMiddleware(bookUpdateDtoSchema),
      controller.updateBook.bind(controller),
    );
    router.delete(
      `${path}/:id`,
      authMiddleware,
      controller.deleteBook.bind(controller),
    );
    return router;
  }
}
