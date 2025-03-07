import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { Router } from 'express';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { SerieController } from '../controller/serie-controller';
import {
  serieCreateSchema,
  serieUpdateSchema,
} from '../../application/dto/serie-dtos';
import { inject, injectable } from 'inversify';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';

export class SerieRoutes {
  static readonly series = '/series';
  static readonly serie = '/series/:id';
}
@injectable()
export class SerieRouterFactory extends BaseRouterFactory<SerieController> {
  constructor(@inject(DI_TYPES.SerieController) controller: SerieController) {
    super(controller);
  }
  setupRoutes(): void {
    this._router.get(
      SerieRoutes.series,
      this.controller.getSeries.bind(this.controller),
    );
    this._router.get(
      SerieRoutes.serie,
      this.controller.getSerie.bind(this.controller),
    );
    this._router.post(
      SerieRoutes.series,
      authMiddleware,
      validationMiddleware(serieCreateSchema),
      this.controller.createSerie.bind(this.controller),
    );
    this._router.patch(
      SerieRoutes.serie,
      authMiddleware,
      validationMiddleware(serieUpdateSchema),
      this.controller.updateSerie.bind(this.controller),
    );
    this._router.delete(
      SerieRoutes.serie,
      authMiddleware,
      this.controller.deleteSerie.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
