import { DI_TYPES } from '@src/core/di/types';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { AppError } from '@src/core/errors/custom-error';
import { ValidationError } from '@src/core/errors/validation-error';
import { ZodError } from 'zod';

import {
  ApiResponse,
  idSchema,
  PagingOptions,
  SortOptions,
} from '@src/core/types';
import {
  BookCreateDto,
  BookDetailDto,
  BookList,
  bookQuerySchema,
  BooksFilter,
  BookUpdateDto,
  GetBooksOptions,
  PopularBookList,
  ReadingBookList,
  ReadingDto,
  ReviewCreateDto,
  UpdateFavoriteDto,
  updateReadingSchema,
  UserFavoriteBookList,
} from '../../application/dtos/book-dto';
import { IBookService } from '../../application/use-cases/interfaces/book-service-interface';
import logger from '@src/core/utils/logger/logger';

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

      res.json({
        message: 'Book created successfully',
        data: result,
        status: 'success',
        timestamp: Date.now(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getBooks(
    req: Request,
    res: Response<ApiResponse<BookList>>,
    next: NextFunction,
  ) {
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

      const options: GetBooksOptions = {
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

      const responseBody: ApiResponse<BookDetailDto> = {
        status: 'success',
        message: 'Book fetched successfully',
        data: result,
        timestamp: Date.now(),
      };
      res.json(responseBody);
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
      res.json({
        message: 'Book updated successfully',
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

  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({
        message: 'Book deleted successfully',
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
      res.json({
        message: 'Review added successfully',
        status: 'success',
        timestamp: Date.now(),
      });
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
      res.json({
        message: 'Like status toggled successfully',
        status: 'success',
        timestamp: Date.now(),
      });
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

  async getUserLikeList(
    req: Request<any, any, { userId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parseRes = idSchema.safeParse(req.query.userId);
      if (parseRes.success === false) {
        const validationErrors = parseRes.error.issues.map((issue) => {
          return {
            fields: issue.path.map((path) => path.toString()),
            constraint: issue.message,
          };
        });
        next(new ValidationError(validationErrors));
        return;
      }

      const userId = parseRes.data;

      const result: Array<string> = await this.service.getUserLikeList(userId);

      const reponseBody: ApiResponse<Array<string>> = {
        status: 'success',
        data: result,
        timestamp: Date.now(),
      };
      res.json(reponseBody);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getReading(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = idSchema.parse(req.params.id);
      const userId: string | undefined = req.body.userId;

      if (!userId) {
        next(AppError.badRequest('User id is required.'));
        return;
      }

      const result = await this.service.getReading(userId, bookId);

      const responseBody: ApiResponse<ReadingDto> = {
        status: 'success',
        data: result,
        timestamp: Date.now(),
      };
      res.json(responseBody);
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

  async getReadingList(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string | undefined = req.body.userId;

      if (!userId) {
        next(AppError.badRequest('User id is required.'));
        return;
      }

      const result = await this.service.getReadingList(userId);
      if (!result) {
        throw AppError.notFound('Book not found');
      }

      const responseBody: ApiResponse<ReadingBookList> = {
        status: 'success',
        data: result,
        timestamp: Date.now(),
      };
      res.json(responseBody);
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

  async updateReading(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = idSchema.parse(req.params.id);
      const userId: string | undefined = req.body.userId;

      if (!userId) {
        next(AppError.badRequest('User id is required.'));
        return;
      }

      const data = updateReadingSchema.parse(req.body);

      await this.service.updateReading(userId, bookId, data);

      const responseBody: ApiResponse<string> = {
        status: 'success',
        timestamp: Date.now(),
      };
      res.json(responseBody);
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

  async getFavoriteBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const parseRes = idSchema.safeParse(req.query.userId);
      if (parseRes.success === false) {
        const validationErrors = parseRes.error.issues.map((issue) => {
          return {
            fields: issue.path.map((path) => path.toString()),
            constraint: issue.message,
          };
        });
        next(new ValidationError(validationErrors));
        return;
      }

      const userId = parseRes.data;

      const result = await this.service.getFavoriteBooks(userId);

      const responseBody: ApiResponse<UserFavoriteBookList> = {
        status: 'success',
        data: result,
        timestamp: Date.now(),
      };
      res.json(responseBody);
    } catch (error) {
      next(error);
    }
  }

  async updateFavorite(
    req: Request<any, any, UpdateFavoriteDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      await this.service.updateFavorite(
        data.userId,
        data.bookId,
        data.isFavorite,
      );
      res.json({
        status: 'success',
        data: {
          isFavorite: data.isFavorite,
          bookId: data.bookId,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopularBooks(req: Request, res: Response, next: NextFunction) {
    console.log('getPopularBooks called');
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      logger.info('Requested limit:', limit);
      const result = await this.service.getPopularBooks(limit);
      console.log('Service result:', JSON.stringify(result, null, 2));

      const responseBody: ApiResponse<PopularBookList> = {
        status: 'success',
        message: 'Popular books fetched successfully',
        data: result,
        timestamp: Date.now(),
      };

      res.json(responseBody);
    } catch (error) {
      next(error);
    }
  }
}
