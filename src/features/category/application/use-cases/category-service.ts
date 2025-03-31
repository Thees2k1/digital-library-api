import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategorySortFields,
  CategorySortOptions,
  categorySortSchema,
  CategoryUpdateDto,
  GetCategoriesOptions,
  GetCategoriesResult,
  Id,
} from '../dto/category-dtos';
import { CategoryEntity } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repository/category-repository';
import { ICategoryService } from './interfaces/category-service-interface';
import logger from '@src/core/utils/logger/logger';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class CategoryService implements ICategoryService {
  private readonly repository: CategoryRepository;
  private readonly cacheService: CacheService;
  constructor(
    @inject(DI_TYPES.CategoryRepository) repository: CategoryRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
  ) {
    this.repository = repository;
    this.cacheService = cacheService;
  }
  async create(data: CategoryCreateDto): Promise<CategoryDetailDto> {
    try {
      const existed = await this.repository.getByNameAsync(data.name);
      if (existed) {
        throw AppError.forbidden('existed category.');
      }

      const input: Partial<CategoryEntity> = {
        name: data.name,
        description: data.description ?? '',
        cover: data.cover ?? '',
        updatedAt: new Date(),
      };

      const res = await this.repository.create(input);

      return this._convertToResultDto(res);
    } catch (error) {
      logger.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServer('Internal server error.');
    }
  }
  async update(id: Id, data: CategoryUpdateDto): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('category not found.');
      }

      await this.repository.update(id, {
        ...existed,
        name: data.name ?? existed.name,
        description: data.description ?? '',
        cover: data.cover ?? '',
        updatedAt: new Date(),
      });
      return existed.id;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  async getList(params: GetCategoriesOptions): Promise<GetCategoriesResult> {
    try {
      const cacheKey = generateCacheKey('category', params);
      const cacheData =
        await this.cacheService.get<GetCategoriesResult>(cacheKey);

      if (cacheData) {
        return cacheData;
      }
      const res = await this.repository.getList(params);
      const total = await this.repository.count(params.filter ?? {});

      const limit = params.paging?.limit ?? DEFAULT_LIST_LIMIT;

      const hasNextPage = res.length >= limit;
      const nextCursor = hasNextPage ? res[res.length - 1].id : '';

      const returnData: GetCategoriesResult = {
        data: res.map((entity) => this._convertToResultDto(entity)),
        limit,
        hasNextPage,
        nextCursor,
        total,
      };
      await this.cacheService.set(cacheKey, returnData, { EX: 60 });
      return returnData;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<CategoryDetailDto | null> {
    try {
      const cacheKey = generateCacheKey('category', { id });
      const cacheData =
        await this.cacheService.get<CategoryDetailDto>(cacheKey);
      if (cacheData) {
        return cacheData;
      }
      const res = await this.repository.getById(id);

      if (!res) {
        return null;
      }

      await this.cacheService.set(cacheKey, this._convertToResultDto(res), {
        EX: 60,
      });
      return this._convertToResultDto(res);
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async delete(id: string): Promise<string> {
    try {
      await this.repository.delete(id);
      return id;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }

  async getPopularCategories(
    params: GetCategoriesOptions,
  ): Promise<GetCategoriesResult> {
    try {
      const cacheKey = generateCacheKey('popular_categories', params);
      const cacheData =
        await this.cacheService.get<GetCategoriesResult>(cacheKey);

      if (cacheData) {
        return cacheData;
      }

      const res = await this.repository.getList({
        ...params,
        sort: {
          field: 'popularityPoints',
          order: 'desc',
        } as CategorySortOptions,
      });

      // const res = await this.repository.getPopularCategories(
      //   params.paging?.limit ?? DEFAULT_LIST_LIMIT,
      //   params.paging?.cursor,
      // );

      const limit = params.paging?.limit ?? DEFAULT_LIST_LIMIT;
      const total = await this.repository.count({});
      const hasNextPage = res.length >= limit;
      const nextCursor = hasNextPage ? res[res.length - 1].id : '';

      const returnData: GetCategoriesResult = {
        data: res.map((entity) => this._convertToResultDto(entity)),
        limit,
        hasNextPage,
        nextCursor,
        total,
      };

      await this.cacheService.set(cacheKey, returnData, { EX: 60 });
      return returnData;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }

  private _convertToResultDto(entity: CategoryEntity): CategoryDetailDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      cover: entity.cover,
      updatedAt: entity.updatedAt,
    };
  }
}
