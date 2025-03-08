import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import { IGenreService } from '../../application/use-cases/interfaces/genre-service-interface';
import {
  GenreCreateDto,
  GenreList,
  GenreUpdateDto,
  GetGenresParams,
} from '../../application/dto/genre-dtos';
import {
  ApiResponse,
  idSchema,
  PagingOptions,
  SortOptions,
} from '@src/core/types';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class GenreController {
  private readonly service: IGenreService;
  constructor(@inject(DI_TYPES.GenreService) service: IGenreService) {
    this.service = service;
  }

  async createGenre(
    req: Request<any, any, GenreCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      res.json({ message: 'Genre created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getGenres(req: Request, res: Response, next: NextFunction) {
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
      const params: GetGenresParams = {
        filter,
        sort: sortOptions,
        paging: paginOptions,
      };
      const result = await this.service.getList(params);

      const resBody = {
        message: 'Genres fetched successfully',
        status: 'success',
        data: result.data,
        pagination: result.paging,
        timestamp: Date.now(),
      } as ApiResponse<GenreList>;

      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }

  async getGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Genre not found');
      }
      const resBody = {
        status: 'success',
        message: 'Genre fetched successfully',
        data: result,
        timestamp: Date.now(),
      };

      res.json(resBody);
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

  async updateGenre(
    req: Request<any, any, GenreUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);
      res.json({
        message: 'Genre updated successfully',
        status: 'success',
        timestamp: Date.now(),
      });
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

  async deleteGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({
        message: 'Genre deleted successfully',
        status: 'success',
        timestamp: Date.now(),
      });
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
}
