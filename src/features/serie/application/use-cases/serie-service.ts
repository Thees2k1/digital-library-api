import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { Id } from '@src/core/types';
import logger from '@src/core/utils/logger/logger';
import { inject, injectable } from 'inversify';
import { v7 as uuid } from 'uuid';
import { SerieEntity } from '../../domain/entities/serie-entity';
import { SerieRepository } from '../../domain/repository/serie-repository';
import {
  GetSeriesParams,
  GetSeriesResult,
  SerieCreateDto,
  SerieDetailDto,
  SerieUpdateDto,
} from '../dto/serie-dtos';
import { ISerieService } from './interfaces/serie-service-interface';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';

@injectable()
export class SerieService implements ISerieService {
  private readonly repository: SerieRepository;
  private readonly cacheService: CacheService;
  constructor(
    @inject(DI_TYPES.SerieRepository) repository: SerieRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
  ) {
    this.repository = repository;
    this.cacheService = cacheService;
  }
  async create(data: SerieCreateDto): Promise<SerieDetailDto> {
    try {
      const existed = await this.repository.getByNameAsync(data.name);
      if (existed) {
        throw AppError.forbidden('existed Serie.');
      }

      const input: SerieEntity = {
        id: uuid(),
        name: data.name,
        cover: data.cover ?? '',
        status: data.status,
        description: data.description ?? '',
        releaseDate: new Date(data.releaseDate),
        books: data.books,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      const res = await this.repository.create(input);

      return this._convertToResultDto(res);
    } catch (error) {
      throw new Error(`error: ${error}`);
    }
  }
  async update(id: Id, data: SerieUpdateDto): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('Serie not found.');
      }

      const updatedDate: SerieEntity = {
        ...existed,
        name: data.name ?? existed.name,
        description:
          data.description === undefined
            ? existed.description
            : (data.description ?? ''),
        cover: data.cover ?? existed.cover,
        status: data.status ?? existed.status,
        releaseDate: data.releaseDate
          ? new Date(data.releaseDate)
          : existed.releaseDate,
        books: data.books ?? existed.books,
        updatedAt: new Date(),
      };

      await this.repository.update(id, updatedDate);
      return existed.id;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
  async getList(params: GetSeriesParams): Promise<GetSeriesResult> {
    try {
      const cacheKey = generateCacheKey('series', params);
      const cacheData = await this.cacheService.get<GetSeriesResult>(cacheKey);
      if (cacheData) {
        return cacheData;
      }

      const data = await this.repository.getList(params);
      const total = await this.repository.count(params);

      const result: GetSeriesResult = {
        data: data.map((item) => this._convertToResultDto(item)),
        paging: {
          total,
          limit: params.paging.limit,
          hasNextPage: data.length >= params.paging.limit,
          nextCursor: data.length > 0 ? data[data.length - 1].id : '',
        },
      };

      await this.cacheService.set(cacheKey, result, { EX: 60 });

      return result;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<SerieDetailDto | null> {
    try {
      const cacheKey = generateCacheKey('serie', { id });

      const cacheData = await this.cacheService.get<SerieDetailDto>(cacheKey);
      if (cacheData) {
        return cacheData;
      }
      const data = await this.repository.getById(id);

      if (!data) {
        return null;
      }
      const result = this._convertToResultDto(data);
      await this.cacheService.set(cacheKey, result, { EX: 60 });

      return result;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async delete(id: string): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('Serie not found.');
      }

      await this.repository.delete(id);
      return id;
    } catch (error) {
      throw AppError.internalServer('Internal server error.');
    }
  }

  private _convertToResultDto(entity: SerieEntity): SerieDetailDto {
    return {
      id: entity.id,
      name: entity.name,
      cover: entity.cover,
      status: entity.status,
      books: entity.books,
      releaseDate: entity.releaseDate ?? null,
      description: entity.description,
      updatedAt: entity.updatedAt,
    };
  }
}
