import { DI_TYPES } from '@src/core/di/types';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import {
  AuthorCreateSchema,
  AuthorUpdateSchema,
} from '../../application/dtos/author-dto';
import { AuthorController } from '../controller/author-controller';
import { authorizeRole } from '@src/core/middlewares/authorize_role';

export class AuthorRoutes {
  static authors = '/authors';
  static author = '/authors/:id';
  static popularAuthors = '/authors/popular';
}

@injectable()
export class AuthorRouterFactory extends BaseRouterFactory<AuthorController> {
  constructor(@inject(DI_TYPES.AuthorController) controller: AuthorController) {
    super(controller);
  }
  setupRoutes(): void {
    this._router.get(
      AuthorRoutes.authors,
      this.controller.getAuthors.bind(this.controller),
    );
    this._router.get(
      AuthorRoutes.popularAuthors,
      this.controller.getPopularAuthors.bind(this.controller),
    );
    this._router.get(
      AuthorRoutes.author,
      this.controller.getAuthor.bind(this.controller),
    );
    this._router.post(
      AuthorRoutes.authors,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(AuthorCreateSchema),
      this.controller.createAuthor.bind(this.controller),
    );
    this._router.patch(
      AuthorRoutes.author,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(AuthorUpdateSchema),
      this.controller.updateAuthor.bind(this.controller),
    );
    this._router.delete(
      AuthorRoutes.author,
      authMiddleware,
      authorizeRole('admin'),
      this.controller.deleteAuthor.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
