import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { authMiddleware } from '@src/features/auth/infrastructure/middleware/auth-middleware';
import { Router } from 'express';
import { CategoryController } from '../controller/category-controller';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from '../../application/dto/category-dtos';

export class CategoryRouter {
  static get routes(): Router {
    const path = '/categories';
    const router = Router();
    const controller = container.get<CategoryController>(
      DI_TYPES.CategoryController,
    );
    router.get(path, authMiddleware, controller.getCategories.bind(controller));
    router.get(`${path}/:id`, controller.getCategory.bind(controller));
    router.post(
      `${path}/:id`,
      validationMiddleware(categoryCreateSchema),
      controller.createCategory.bind(controller),
    );
    router.patch(
      `${path}/:id`,
      validationMiddleware(categoryUpdateSchema),
      controller.updateCategory.bind(controller),
    );
    router.delete(`${path}/:id`, controller.deleteCategory.bind(controller));
    return router;
  }
}
