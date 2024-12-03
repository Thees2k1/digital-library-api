import { container } from '@src/core/di/container';
import { Router } from 'express';
import { AuthorController } from '../controller/author-controller';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/features/auth/infrastructure/middleware/auth-middleware';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import {
  AuthorCreateSchema,
  AuthorUpdateSchema,
} from '../../application/dtos/author-dto';

export class AuthorRouter {
  static get routes(): Router {
    const path = '/authors';
    const router = Router();
    const controller = container.get<AuthorController>(
      DI_TYPES.AuthorController,
    );
    router.get(path, authMiddleware, controller.getAuthors.bind(controller));
    router.get(`${path}/:id`, controller.getAuthor.bind(controller));
    router.post(
      `${path}/:id`,
      validationMiddleware(AuthorCreateSchema),
      controller.createAuthor.bind(controller),
    );
    router.patch(
      `${path}/:id`,
      validationMiddleware(AuthorUpdateSchema),
      controller.updateAuthor.bind(controller),
    );
    router.delete(`${path}/:id`, controller.deleteAuthor.bind(controller));
    return router;
  }
}
