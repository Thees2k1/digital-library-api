import { DI_TYPES } from '@src/core/di/types';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import {
  publisherCreateSchema,
  publisherUpdateSchema,
} from '../../application/dto/publisher-dtos';
import { PublisherController } from '../controller/publisher-controller';

export class PublisherRoutes {
  static readonly publishers = '/publishers';
  static readonly publisher = '/publishers/:id';
}
@injectable()
export class PublisherRouterFactory extends BaseRouterFactory<PublisherController> {
  constructor(
    @inject(DI_TYPES.PublisherController) controller: PublisherController,
  ) {
    super(controller);
  }

  setupRoutes(): void {
    this._router.get(
      PublisherRoutes.publishers,
      this.controller.getCategories.bind(this.controller),
    );
    this._router.get(
      PublisherRoutes.publisher,
      this.controller.getPublisher.bind(this.controller),
    );
    this._router.post(
      PublisherRoutes.publishers,
      authMiddleware,
      validationMiddleware(publisherCreateSchema),
      this.controller.createPublisher.bind(this.controller),
    );
    this._router.patch(
      PublisherRoutes.publisher,
      authMiddleware,
      validationMiddleware(publisherUpdateSchema),
      this.controller.updatePublisher.bind(this.controller),
    );
    this._router.delete(
      PublisherRoutes.publisher,
      authMiddleware,
      this.controller.deletePublisher.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
