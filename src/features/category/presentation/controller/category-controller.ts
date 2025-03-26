import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { ICategoryService } from '../../application/use-cases/interfaces/category-service-interface';
import { Request, Response, NextFunction } from 'express';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategoryUpdateDto,
  GetCategoriesParams,
  idSchema,
} from '../../application/dto/category-dtos';
import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';
import { ApiResponse, PagingOptions, SortOptions } from '@src/core/types';

//handel pagination.
/*
 follow only cursor base pagination. lost of coutling total. we may not need total calculation.
 
*/

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
      const query = req.query;

      const filters = {};

      const sortOptions: SortOptions = {
        field: '',
        order: 'asc',
      };

      const paginOptions: PagingOptions = {
        cursor: query?.cursor as string,
        limit: query.limit
          ? parseInt(query.limit as string)
          : DEFAULT_LIST_LIMIT,
      };

      const params: GetCategoriesParams = {
        filter: filters,
        paging: paginOptions,
        sort: sortOptions,
      };

      const result = await this.service.getList(params);

      const resBody: ApiResponse<Array<CategoryDetailDto>> = {
        message: 'Categories fetched successfully',
        data: result.data,
        status: 'success',
        pagination: {
          limit: params.paging.limit,
          hasNextPage: result.hasNextPage,
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

      const sortOptions: SortOptions = {
        field: 'popularityPoints',
        order: 'desc',
      };

      const paginOptions: PagingOptions = {
        cursor: query?.cursor as string,
        limit: query.limit
          ? parseInt(query.limit as string)
          : DEFAULT_LIST_LIMIT,
      };

      const params: GetCategoriesParams = {
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
          limit: params.paging.limit,
          hasNextPage: result.hasNextPage,
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
