import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { Router } from 'express';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { TagController } from '../controller/tag-controller';
import {
  TagCreateSchema,
  TagUpdateSchema,
} from '../../application/dto/tag-dtos';
import { inject, injectable } from 'inversify';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { authorizeRole } from '@src/core/middlewares/authorize_role';

export class TagRoutes {
  static readonly tags = '/tags';
  static readonly tag = '/tags/:id';
}
@injectable()
export class TagRouterFactory extends BaseRouterFactory<TagController> {
  constructor(@inject(DI_TYPES.TagController) controller: TagController) {
    super(controller);
  }

  setupRoutes(): void {
    this._router.get(
      TagRoutes.tags,
      this.controller.getTags.bind(this.controller),
    );
    this._router.get(
      TagRoutes.tag,
      this.controller.getTag.bind(this.controller),
    );
    this._router.post(
      TagRoutes.tags,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(TagCreateSchema),
      this.controller.createTag.bind(this.controller),
    );
    this._router.patch(
      TagRoutes.tag,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(TagUpdateSchema),
      this.controller.updateTag.bind(this.controller),
    );
    this._router.delete(
      TagRoutes.tag,
      authMiddleware,
      authorizeRole('admin'),
      this.controller.deleteTag.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
