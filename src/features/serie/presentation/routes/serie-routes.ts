import { DI_TYPES } from '@src/core/di/types';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import {
  serieCreateSchema,
  serieUpdateSchema,
} from '../../application/dto/serie-dtos';
import { SerieController } from '../controller/serie-controller';
import { authorizeRole } from '@src/core/middlewares/authorize_role';

export class SerieRoutes {
  static readonly series = '/series';
  static readonly serie = '/series/:id';
  static readonly popularSeries = '/series/popular';
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
      SerieRoutes.popularSeries,
      this.controller.getPopularSeries.bind(this.controller),
    );
    this._router.get(
      SerieRoutes.serie,
      this.controller.getSerie.bind(this.controller),
    );
    this._router.post(
      SerieRoutes.series,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(serieCreateSchema),
      this.controller.createSerie.bind(this.controller),
    );
    this._router.patch(
      SerieRoutes.serie,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(serieUpdateSchema),
      this.controller.updateSerie.bind(this.controller),
    );
    this._router.delete(
      SerieRoutes.serie,
      authMiddleware,
      authorizeRole('admin'),
      this.controller.deleteSerie.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
