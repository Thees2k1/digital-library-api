import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import {
  GenreCreateDto,
  GenreDetailDto,
  GenreUpdateDto,
  GetGenresParams,
  GetGenresResult,
} from '../dto/genre-dtos';
import logger from '@src/core/utils/logger/logger';
import { GenreRepository } from '../../domain/repository/genre-repository';
import { IGenreService } from './interfaces/genre-service-interface';
import { GenreEntity } from '../../domain/entities/genre-entity';
import { Id } from '@src/core/types';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class GenreService implements IGenreService {
  private readonly repository: GenreRepository;
  private readonly cacheService: CacheService;
  constructor(
    @inject(DI_TYPES.GenreRepository) repository: GenreRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
  ) {
    this.cacheService = cacheService;
    this.repository = repository;
  }
  async create(data: GenreCreateDto): Promise<GenreDetailDto> {
    try {
      const existed = await this.repository.getByNameAsync(data.name);
      if (existed) {
        throw AppError.forbidden('existed Genre.');
      }

      const input: Partial<GenreEntity> = {
        name: data.name,
        description: data.description ?? undefined,
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
  async update(id: Id, data: GenreUpdateDto): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('Genre not found.');
      }

      const updatedDate: Partial<GenreEntity> = {
        ...existed,
        name: data.name ?? existed.name,
        description:
          data.description === undefined
            ? existed.description
            : (data.description ?? ''),
        updatedAt: new Date(),
      };

      await this.repository.update(id, updatedDate);
      return existed.id;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  async getList(params: GetGenresParams): Promise<GetGenresResult> {
    try {
      const cacheKey = generateCacheKey('genres', params);
      const cacheData = await this.cacheService.get<GetGenresResult>(cacheKey);
      if (cacheData) {
        return cacheData;
      }

      const res = await this.repository.getList(params);
      const total = await this.repository.count({});

      const limit = params.paging?.limit ?? DEFAULT_LIST_LIMIT;
      const hasNextPage = res.length >= limit;
      const nextCursor = hasNextPage ? res[res.length - 1].id : '';

      const resultData: GetGenresResult = {
        data: res.map((genre) => {
          return this._convertToResultDto(genre);
        }),
        paging: {
          total,
          limit,
          hasNextPage,
          nextCursor,
        },
      };

      await this.cacheService.set(cacheKey, resultData, { EX: 60 });

      return resultData;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<GenreDetailDto | null> {
    try {
      const cacheKey = generateCacheKey('genre', { id });

      const cacheData = await this.cacheService.get<GenreDetailDto>(cacheKey);
      if (cacheData) {
        return cacheData;
      }

      const res = await this.repository.getById(id);
      if (!res) {
        return null;
      }

      await this.cacheService.set(cacheKey, this._convertToResultDto(res));

      return this._convertToResultDto(res);
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async delete(id: string): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('Genre not found.');
      }

      await this.repository.delete(id);
      return id;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServer('Internal server error.');
    }
  }

  private _convertToResultDto(entity: GenreEntity): GenreDetailDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      updatedAt: entity.updatedAt,
    };
  }
}
