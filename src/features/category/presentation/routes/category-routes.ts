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
import { authorizeRole } from '@src/core/middlewares/authorize_role';

export class CategoryRoutes {
  static readonly categories = '/categories';
  static readonly category = '/categories/:id';
  static readonly popularCategories = '/categories/popular';
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
      CategoryRoutes.popularCategories,
      this.controller.getPopularCategories.bind(this.controller),
    );
    this._router.get(
      CategoryRoutes.category,
      this.controller.getCategory.bind(this.controller),
    );
    this._router.post(
      CategoryRoutes.categories,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(categoryCreateSchema),
      this.controller.createCategory.bind(this.controller),
    );
    this._router.patch(
      CategoryRoutes.category,
      authMiddleware,
      authorizeRole('admin'),
      validationMiddleware(categoryUpdateSchema),
      this.controller.updateCategory.bind(this.controller),
    );
    this._router.delete(
      CategoryRoutes.category,
      authMiddleware,
      authorizeRole('admin'),
      this.controller.deleteCategory.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
