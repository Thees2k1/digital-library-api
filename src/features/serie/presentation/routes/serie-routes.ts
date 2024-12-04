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

export class SerieRouter {
  static get routes(): Router {
    const path = '/series';
    const router = Router();
    const controller = container.get<SerieController>(DI_TYPES.SerieController);
    router.get(path, controller.getSeries.bind(controller));
    router.get(`${path}/:id`, controller.getSerie.bind(controller));
    router.post(
      path,
      authMiddleware,
      validationMiddleware(serieCreateSchema),
      controller.createSerie.bind(controller),
    );
    router.patch(
      `${path}/:id`,
      authMiddleware,
      validationMiddleware(serieUpdateSchema),
      controller.updateSerie.bind(controller),
    );
    router.delete(
      `${path}/:id`,
      authMiddleware,
      controller.deleteSerie.bind(controller),
    );
    return router;
  }
}
