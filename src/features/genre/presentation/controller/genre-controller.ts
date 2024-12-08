import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import { IGenreService } from '../../application/use-cases/interfaces/genre-service-interface';
import {
  GenreCreateDto,
  GenreUpdateDto,
} from '../../application/dto/genre-dtos';
import { idSchema } from '@src/core/types';

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
      const result = await this.service.getList(query);
      res.json({ data: result, message: 'Genres fetched successfully' });
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
      res.json({ data: result, message: 'Genre fetched successfully' });
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
      res.json({ message: 'Genre updated successfully' });
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
      res.json({ message: 'Genre deleted successfully' });
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
