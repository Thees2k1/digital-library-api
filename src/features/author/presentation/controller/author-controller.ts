import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import {
  ApiResponse,
  idSchema,
  PagingOptions,
  SortOptions,
} from '@src/core/types';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';
import {
  AuthorCreateDto,
  AuthorDetailDto,
  AuthorList,
  AuthorUpdateDto,
  GetAuthorsParams,
} from '../../application/dtos/author-dto';
import { IAuthorService } from '../../application/use-cases/interfaces/author-service-interface';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class AuthorController {
  private readonly service: IAuthorService;
  constructor(@inject(DI_TYPES.AuthorService) service: IAuthorService) {
    this.service = service;
  }

  async createAuthor(
    req: Request<any, any, AuthorCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      await this.service.create(data);

      const resBody: ApiResponse<AuthorCreateDto> = {
        message: 'Author created successfully',
        data,
        status: 'success',
        timestamp: Date.now(),
      };
      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }

  async getAuthors(
    req: Request,
    res: Response<ApiResponse<AuthorList>>,
    next: NextFunction,
  ) {
    try {
      const query = req.query;
      const filter = {};

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
      const params: GetAuthorsParams = {
        filter,
        sort: sortOptions,
        paging: paginOptions,
      };
      const result = await this.service.getList(params);

      const resBody = {
        message: 'Authors fetched successfully',
        status: 'success',
        data: result.data,
        pagination: {
          nextCursor: result.nextCursor,
          limit: result.limit,
          total: result.total,
          hasNextPage: result.hasNextPage,
        },
        timestamp: Date.now(),
      } as ApiResponse<AuthorList>;
      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }

  async getAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Author not found');
      }
      const resBody: ApiResponse<AuthorDetailDto> = {
        message: 'Author fetched successfully',
        status: 'success',
        data: result,
        timestamp: Date.now(),
      };
      res.json(resBody);
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.badRequest(error.toString()));
      } else {
        next(error);
      }
    }
  }

  async updateAuthor(
    req: Request<any, any, AuthorUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);

      const resBody = {
        message: 'Author updated successfully',
        status: 'success',
        timestamp: Date.now(),
      };
      res.json(resBody);
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }

  async deleteAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);

      const resBody = {
        message: 'Author deleted successfully',
        status: 'success',
        timestamp: Date.now(),
      };
      res.json(resBody);
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }
}
