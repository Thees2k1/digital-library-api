import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import { idSchema } from '@src/core/types';
import { ISerieService } from '../../application/use-cases/interfaces/serie-service-interface';
import {
  SerieCreateDto,
  SerieUpdateDto,
} from '../../application/dto/serie-dtos';

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
      const result = await this.service.getList();
      res.json({ data: result, message: 'Series fetched successfully' });
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
      res.json({ data: result, message: 'Serie fetched successfully' });
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
      res.json({ message: 'Serie updated successfully' });
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
      res.json({ message: 'Serie deleted successfully' });
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
