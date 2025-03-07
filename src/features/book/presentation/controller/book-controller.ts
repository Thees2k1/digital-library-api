import { DI_TYPES } from '@src/core/di/types';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { AppError } from '@src/core/errors/custom-error';
import { ValidationError } from '@src/core/errors/validation-error';
import { ZodError } from 'zod';

import { ApiResponse, idSchema } from '@src/core/types';
import {
  BookCreateDto,
  BookList,
  bookQuerySchema,
  BookUpdateDto,
  ReviewCreateDto,
} from '../../application/dtos/book-dto';
import { IBookService } from '../../application/use-cases/interfaces/book-service-interface';
import {
  BooksFilter,
  GetListOptions,
  PagingOptions,
  SortOptions,
} from '../../application/use-cases/interfaces/parameters';

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
      const query = bookQuerySchema.parse(req.query);

      const filters: BooksFilter = {
        query: query.q,
        genres: query.genres ? query.genres.split(',') : undefined,
        authorId: query.author,
        categoryId: query.category,
        publisherId: query.publisher,
        releaseDateRange:
          query.release_date_gte && query.release_date_lte
            ? {
                from: query.release_date_gte,
                to: query.release_date_lte,
              }
            : undefined,
      };

      const sortOptions: SortOptions | undefined = query.sort && {
        field: query.sort.includes('-') ? query.sort.slice(1) : query.sort,
        order: query.sort.includes('-') ? 'desc' : 'asc',
      };

      const paginOptions: PagingOptions = {
        cursor: query.cursor,
        limit: query.limit,
      };

      const options: GetListOptions = {
        filter: filters,
        sort: sortOptions,
        paging: paginOptions,
      };

      const result = await this.service.getList(options);

      const reponseBody: ApiResponse<BookList> = {
        status: 'success',
        message: 'Books fetched successfully',
        data: result.data,
        filters: filters,
        pagination: {
          limit: paginOptions.limit,
          total: result.total,
          hasNextPage: result.hasNextPage,
          nextCursor: result.nextCursor,
        },
        timestamp: Date.now(),
      };
      res.json(reponseBody);
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

  async addReview(
    req: Request<any, any, ReviewCreateDto & { userId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const input: ReviewCreateDto = {
        ...data,
        userId: req.body.userId,
        bookId: req.params.id,
      };
      await this.service.addReview(input);
      res.json({ message: 'Review added successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = idSchema.parse(req.params.id);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await this.service.getReviews(bookId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(
    req: Request<any, any, { userId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const bookId = idSchema.parse(req.params.id);
      const userId = req.body.userId;
      await this.service.toggleLike(userId, bookId);
      res.json({ message: 'Like status toggled successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getLikeCount(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = idSchema.parse(req.params.id);
      const count = await this.service.getLikeCount(bookId);
      res.json({ likeCount: count });
    } catch (error) {
      next(error);
    }
  }

  async searchBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await this.service.search(query, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
