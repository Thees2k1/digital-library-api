import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { idSchema } from '@src/core/types';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';
import {
  AuthorCreateDto,
  AuthorUpdateDto,
} from '../../application/dtos/author-dto';
import { IAuthorService } from '../../application/use-cases/interfaces/author-service-interface';

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
      const result = await this.service.create(data);
      res.json({ message: 'Author created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.service.getList();
      res.json({ data: result, message: 'Authors fetched successfully' });
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
      res.json({ data: result, message: 'Author fetched successfully' });
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
      res.json({ message: 'Author updated successfully' });
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
      res.json({ message: 'Author deleted successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }
}
