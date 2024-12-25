import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { Router } from 'express';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { PublisherController } from '../controller/publisher-controller';
import {
  publisherCreateSchema,
  publisherUpdateSchema,
} from '../../application/dto/publisher-dtos';

export class PublisherRouter {
  static get routes(): Router {
    const path = '/publishers';
    const router = Router();
    const controller = container.get<PublisherController>(
      DI_TYPES.PublisherController,
    );
    router.get(path, controller.getCategories.bind(controller));
    router.get(`${path}/:id`, controller.getPublisher.bind(controller));
    router.post(
      path,
      authMiddleware,
      validationMiddleware(publisherCreateSchema),
      controller.createPublisher.bind(controller),
    );
    router.patch(
      `${path}/:id`,
      authMiddleware,
      validationMiddleware(publisherUpdateSchema),
      controller.updatePublisher.bind(controller),
    );
    router.delete(
      `${path}/:id`,
      authMiddleware,
      controller.deletePublisher.bind(controller),
    );
    return router;
  }
}
