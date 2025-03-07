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
import { inject, injectable } from 'inversify';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';

export class GenreRoutes {
  static readonly genres = '/genres';
  static readonly genre = '/genres/:id';
}
@injectable()
export class GenreRouterFactory extends BaseRouterFactory<GenreController> {
  constructor(@inject(DI_TYPES.GenreController) controller: GenreController) {
    super(controller);
  }

  setupRoutes(): void {
    this._router.get(
      GenreRoutes.genres,
      this.controller.getGenres.bind(this.controller),
    );
    this._router.get(
      GenreRoutes.genre,
      this.controller.getGenre.bind(this.controller),
    );
    this._router.post(
      GenreRoutes.genres,
      authMiddleware,
      validationMiddleware(genreCreateSchema),
      this.controller.createGenre.bind(this.controller),
    );
    this._router.patch(
      GenreRoutes.genre,
      authMiddleware,
      validationMiddleware(genreUpdateSchema),
      this.controller.updateGenre.bind(this.controller),
    );
    this._router.delete(
      GenreRoutes.genre,
      authMiddleware,
      this.controller.deleteGenre.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
