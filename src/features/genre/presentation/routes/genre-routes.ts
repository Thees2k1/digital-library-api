import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { Router } from 'express';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { GenreController } from '../controller/genre-controller';
import {
  genreCreateSchema,
  genreUpdateSchema,
} from '../../application/dto/genre-dtos';

export class GenreRouter {
  static get routes(): Router {
    const path = '/genres';
    const router = Router();
    const controller = container.get<GenreController>(DI_TYPES.GenreController);
    router.get(path, controller.getGenres.bind(controller));
    router.get(`${path}/:id`, controller.getGenre.bind(controller));
    router.post(
      path,
      authMiddleware,
      validationMiddleware(genreCreateSchema),
      controller.createGenre.bind(controller),
    );
    router.patch(
      `${path}/:id`,
      authMiddleware,
      validationMiddleware(genreUpdateSchema),
      controller.updateGenre.bind(controller),
    );
    router.delete(
      `${path}/:id`,
      authMiddleware,
      controller.deleteGenre.bind(controller),
    );
    return router;
  }
}
