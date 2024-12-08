import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import { IPublisherService } from '../../application/use-cases/interfaces/publisher-service-interface';
import {
  PublisherCreateDto,
  PublisherUpdateDto,
} from '../../application/dto/publisher-dtos';
import { idSchema } from '@src/core/types';

@injectable()
export class PublisherController {
  private readonly service: IPublisherService;
  constructor(@inject(DI_TYPES.PublisherService) service: IPublisherService) {
    this.service = service;
  }

  async createPublisher(
    req: Request<any, any, PublisherCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      res.json({ message: 'Publisher created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const result = await this.service.getList(query);
      res.json({ data: result, message: 'Publishers fetched successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getPublisher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Publisher not found');
      }
      res.json({ data: result, message: 'Publisher fetched successfully' });
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

  async updatePublisher(
    req: Request<any, any, PublisherUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);
      res.json({ message: 'Publisher updated successfully' });
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

  async deletePublisher(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({ message: 'Publisher deleted successfully' });
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
