import { DI_TYPES } from '@src/core/di/types';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';
import { AppError } from '@src/core/errors/custom-error';
import { ValidationError } from '@src/core/errors/validation-error';
import {
  ApiResponse,
  idSchema,
  PagingOptions,
  sortOrderSchema,
} from '@src/core/types';
import { ZodError } from 'zod';
import {
  SerieCreateDto,
  SerieList,
  serieSortFieldsSchema,
  SerieSortOptions,
  seriesQuerySchema,
  SerieUpdateDto,
} from '../../application/dto/serie-dtos';
import { ISerieService } from '../../application/use-cases/interfaces/serie-service-interface';

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
      const query = seriesQuerySchema.parse(req.query);

      const filter = {
        ...(query.q ? { name: query.q } : {}),
        ...(query.releaseDate ? { releaseDate: query.releaseDate } : {}),
        status: query.status,
      };
      const sortOptions: SerieSortOptions = {
        field: serieSortFieldsSchema.parse(query.sort),
        order: sortOrderSchema.parse(query.order),
      };

      const pagingOptions: PagingOptions = {
        cursor: query.cursor,
        limit: query.limit ?? DEFAULT_LIST_LIMIT,
      };

      const result = await this.service.getList({
        filter,
        sort: sortOptions,
        paging: pagingOptions,
      });

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

  async getPopularSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const cursor = req.query.cursor as string | undefined;

      const result = await this.service.getPopularSeries(limit, cursor);

      const resBody: ApiResponse<SerieList> = {
        message: 'Popular authors fetched successfully',
        status: 'success',
        data: result.data,
        pagination: result.paging,
        timestamp: Date.now(),
      };

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
