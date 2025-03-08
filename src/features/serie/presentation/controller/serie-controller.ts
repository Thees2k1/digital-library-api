import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import {
  ApiResponse,
  idSchema,
  PagingOptions,
  SortOptions,
} from '@src/core/types';
import { ISerieService } from '../../application/use-cases/interfaces/serie-service-interface';
import {
  SerieCreateDto,
  SerieList,
  SerieUpdateDto,
} from '../../application/dto/serie-dtos';
import { GetGenresParams } from '@src/features/genre/application/dto/genre-dtos';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class SerieController {
  private readonly service: ISerieService;
  constructor(@inject(DI_TYPES.SerieService) service: ISerieService) {
    this.service = service;
  }

  async createSerie(
    req: Request<any, any, SerieCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      res.json({ message: 'Serie created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getSeries(req: Request, res: Response, next: NextFunction) {
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
        message: 'Series fetched successfully',
        status: 'success',
        data: result.data,
        pagination: result.paging,
        timestamp: Date.now(),
      } as ApiResponse<SerieList>;
      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }

  async getSerie(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Serie not found');
      }
      const resBody = {
        status: 'success',
        message: 'Serie fetched successfully',
        data: result,
        timestamp: Date.now(),
      } as ApiResponse<any>;
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

  async updateSerie(
    req: Request<any, any, SerieUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);
      res.json({
        message: 'Serie updated successfully',
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

  async deleteSerie(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({ message: 'Serie deleted successfully', status: 'success' });
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
