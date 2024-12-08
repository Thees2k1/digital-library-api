import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';

import { idSchema } from '@src/core/types';
import { IBookService } from '../../application/use-cases/interfaces/book-service-interface';
import {
  BookCreateDto,
  bookListQueryDtoSchema,
  BookUpdateDto,
} from '../../application/dtos/book-dto';

@injectable()
export class BookController {
  private readonly service: IBookService;
  constructor(@inject(DI_TYPES.BookService) service: IBookService) {
    this.service = service;
  }

  async createBook(
    req: Request<any, any, BookCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      res.json({ message: 'Book created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = bookListQueryDtoSchema.parse(req.query);
      const result = await this.service.getList(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Book not found');
      }
      res.json({ data: result, message: 'Book fetched successfully' });
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

  async updateBook(
    req: Request<any, any, BookUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);
      res.json({ message: 'Book updated successfully' });
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

  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({ message: 'Book deleted successfully' });
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
