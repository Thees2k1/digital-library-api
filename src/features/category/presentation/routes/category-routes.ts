import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { Router } from 'express';
import { CategoryController } from '../controller/category-controller';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from '../../application/dto/category-dtos';
import { inject, injectable } from 'inversify';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';

export class CategoryRoutes {
  static readonly categories = '/categories';
  static readonly category = '/categories/:id';
}
@injectable()
export class CategoryRouterFactory extends BaseRouterFactory<CategoryController> {
  constructor(
    @inject(DI_TYPES.CategoryController) controller: CategoryController,
  ) {
    super(controller);
  }

  setupRoutes(): void {
    this._router.get(
      CategoryRoutes.categories,
      this.controller.getCategories.bind(this.controller),
    );
    this._router.get(
      CategoryRoutes.category,
      this.controller.getCategory.bind(this.controller),
    );
    this._router.post(
      CategoryRoutes.categories,
      authMiddleware,
      validationMiddleware(categoryCreateSchema),
      this.controller.createCategory.bind(this.controller),
    );
    this._router.patch(
      CategoryRoutes.category,
      authMiddleware,
      validationMiddleware(categoryUpdateSchema),
      this.controller.updateCategory.bind(this.controller),
    );
    this._router.delete(
      CategoryRoutes.category,
      authMiddleware,
      this.controller.deleteCategory.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
