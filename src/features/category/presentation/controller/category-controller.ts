import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { ValidationError } from '@src/core/errors/validation-error';
import { ApiResponse, PagingOptions, sortOrderSchema } from '@src/core/types';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  categoryQuerySchema,
  CategorySortOptions,
  categorySortSchema,
  CategoryUpdateDto,
  GetCategoriesOptions,
  idSchema,
} from '../../application/dto/category-dtos';
import { ICategoryService } from '../../application/use-cases/interfaces/category-service-interface';

@injectable()
export class CategoryController {
  private readonly service: ICategoryService;
  constructor(@inject(DI_TYPES.CategoryService) service: ICategoryService) {
    this.service = service;
  }

  async createCategory(
    req: Request<any, any, CategoryCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      res.json({ message: 'Category created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = categoryQuerySchema.parse(req.query);
      const filter = query.q
        ? {
            name: query.q,
          }
        : undefined;

      const sortOptions: CategorySortOptions = {
        field: categorySortSchema.parse(query.sort),

        order: sortOrderSchema.parse(query.order),
      };

      const paginOptions: PagingOptions = {
        cursor: query?.cursor as string,
        limit: query.limit ?? DEFAULT_LIST_LIMIT,
      };
      const params: GetCategoriesOptions = {
        filter,
        sort: sortOptions,
        paging: paginOptions,
      };

      const result = await this.service.getList(params);

      const resBody: ApiResponse<Array<CategoryDetailDto>> = {
        message: 'Categories fetched successfully',
        data: result.data,
        status: 'success',
        pagination: {
          limit: result.limit,
          nextCursor: result.nextCursor,
          total: result.total || 0,
        },
        timestamp: Date.now(),
      };
      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }

  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Category not found');
      }
      res.json({ data: result, message: 'Category fetched successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => {
          return {
            fields: issue.path.map((path) => path.toString()),
            constraint: issue.message,
          };
        });
        next(new ValidationError(validationErrors));
        return;
      }
      next(error);
    }
  }

  async updateCategory(
    req: Request<any, any, CategoryUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);
      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => {
          return {
            fields: issue.path.map((path) => path.toString()),
            constraint: issue.message,
          };
        });
        next(new ValidationError(validationErrors));
        return;
      }
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => {
          return {
            fields: issue.path.map((path) => path.toString()),
            constraint: issue.message,
          };
        });
        next(new ValidationError(validationErrors));
        return;
      }
      next(error);
    }
  }

  async getPopularCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const filters = {};

      const sortOptions: CategorySortOptions = {
        field: 'popularityPoints',
        order: 'desc',
      };

      const paginOptions: PagingOptions = {
        cursor: query?.cursor as string,
        limit: query.limit
          ? parseInt(query.limit as string)
          : DEFAULT_LIST_LIMIT,
      };

      const params: GetCategoriesOptions = {
        filter: filters,
        paging: paginOptions,
        sort: sortOptions,
      };

      const result = await this.service.getPopularCategories(params);

      const resBody: ApiResponse<Array<CategoryDetailDto>> = {
        message: 'Popular categories fetched successfully',
        data: result.data,
        status: 'success',
        pagination: {
          limit: result.limit,
          nextCursor: result.nextCursor,
          total: result.total || 0,
        },
        timestamp: Date.now(),
      };

      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }
}
