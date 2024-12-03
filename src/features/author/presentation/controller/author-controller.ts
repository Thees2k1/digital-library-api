import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthorInteractor } from '../../application/interactor/interfaces/interactor';
import { DI_TYPES } from '@src/core/di/types';
import {
  AuthorCreateDto,
  AuthorIdSchema,
  AuthorUpdateDto,
} from '../../application/dtos/author-dto';
import { ZodError } from 'zod';
import { AppError } from '@src/core/errors/custom-error';

@injectable()
export class AuthorController {
  private readonly interactor: IAuthorInteractor;
  constructor(
    @inject(DI_TYPES.AuthorInteractor) interactor: IAuthorInteractor,
  ) {
    this.interactor = interactor;
  }

  async createAuthor(
    req: Request<any, any, AuthorCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.interactor.create(data);
      res.json({ message: 'Author created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAuthors(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.interactor.getList();
      res.json({ data: result, message: 'Authors fetched successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = AuthorIdSchema.parse(req.params.id);
      const result = await this.interactor.getById(id);
      if (!result) {
        throw AppError.notFound('Author not found');
      }
      res.json({ data: result, message: 'Author fetched successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.badRequest(error.toString()));
      }
      next(error);
    }
  }

  async updateAuthor(
    req: Request<any, any, AuthorUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = AuthorIdSchema.parse(req.params.id);
      const data = req.body;
      await this.interactor.update(id, data);
      res.json({ message: 'Author updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = AuthorIdSchema.parse(req.params.id);
      await this.interactor.delete(id);
      res.json({ message: 'Author deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
