import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@src/core/errors/custom-error';
import { ZodError } from 'zod';
import { ValidationError } from '@src/core/errors/validation-error';
import { ITagService } from '../../application/use-cases/interfaces/tag-service-interface';
import {
  TagCreateDto,
  TagList,
  TagUpdateDto,
  GetTagsOptions,
  tagsQuerySchema,
  TagSortOptions,
  tagSortFieldsSchema,
} from '../../application/dto/tag-dtos';
import {
  ApiResponse,
  idSchema,
  PagingOptions,
  SortOptions,
  SortOrder,
} from '@src/core/types';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class TagController {
  private readonly service: ITagService;
  constructor(@inject(DI_TYPES.TagService) service: ITagService) {
    this.service = service;
  }

  async createTag(
    req: Request<any, any, TagCreateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.create(data);
      res.json({ message: 'Tag created successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const query = tagsQuerySchema.parse(req.query);
      const filter = query.q
        ? {
            name: query.q,
          }
        : undefined;

      const sortOptions: TagSortOptions = {
        field: tagSortFieldsSchema.parse(query.sort),
        order: query.order as SortOrder,
      };

      const paginOptions: PagingOptions = {
        cursor: query?.cursor as string,
        limit: query.limit ?? DEFAULT_LIST_LIMIT,
      };
      const params: GetTagsOptions = {
        filter,
        sort: sortOptions,
        paging: paginOptions,
      };
      const result = await this.service.getList(params);

      const resBody = {
        message: 'Tags fetched successfully',
        status: 'success',
        data: result.data,
        pagination: result.paging,
        timestamp: Date.now(),
      } as ApiResponse<TagList>;

      res.json(resBody);
    } catch (error) {
      next(error);
    }
  }

  async getTag(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      const result = await this.service.getById(id);
      if (!result) {
        throw AppError.notFound('Tag not found');
      }
      const resBody = {
        status: 'success',
        message: 'Tag fetched successfully',
        data: result,
        timestamp: Date.now(),
      };

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

  async updateTag(
    req: Request<any, any, TagUpdateDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = idSchema.parse(req.params.id);
      const data = req.body;
      await this.service.update(id, data);
      res.json({
        message: 'Tag updated successfully',
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

  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idSchema.parse(req.params.id);
      await this.service.delete(id);
      res.json({
        message: 'Tag deleted successfully',
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
}
