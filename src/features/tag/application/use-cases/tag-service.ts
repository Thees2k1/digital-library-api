import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import {
  TagCreateDto,
  TagDetailDto,
  TagUpdateDto,
  GetTagsParams,
  GetTagsResult,
} from '../dto/tag-dtos';
import logger from '@src/core/utils/logger/logger';
import { TagRepository } from '../../domain/repository/tag-repository';
import { ITagService } from './interfaces/tag-service-interface';
import { TagEntity } from '../../domain/entities/tag-entity';
import { Id } from '@src/core/types';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';

@injectable()
export class TagService implements ITagService {
  private readonly repository: TagRepository;
  private readonly cacheService: CacheService;
  constructor(
    @inject(DI_TYPES.TagRepository) repository: TagRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
  ) {
    this.cacheService = cacheService;
    this.repository = repository;
  }
  async create(data: TagCreateDto): Promise<TagDetailDto> {
    try {
      const existed = await this.repository.getByNameAsync(data.name);
      if (existed) {
        throw AppError.forbidden('existed Tag.');
      }

      const input: Partial<TagEntity> = {
        name: data.name,
        description: data.description ?? undefined,
      };

      const res = await this.repository.create(input);

      return this._convertToResultDto(res);
    } catch (error) {
      throw new Error(`error: ${error}`);
    }
  }
  async update(id: Id, data: TagUpdateDto): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('Tag not found.');
      }

      const updatedDate: Partial<TagEntity> = {
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
  async getList(params: GetTagsParams): Promise<GetTagsResult> {
    try {
      const cacheKey = generateCacheKey('Tags', params);
      const cacheData = await this.cacheService.get<GetTagsResult>(cacheKey);
      if (cacheData) {
        return cacheData;
      }

      const res = await this.repository.getList(params);
      const total = await this.repository.count({});

      const resultData: GetTagsResult = {
        data: res.map((Tag) => {
          return this._convertToResultDto(Tag);
        }),
        paging: {
          total: total,
          limit: params.paging.limit,
          hasNextPage: res.length >= params.paging.limit,
          nextCursor: res.length > 0 ? res[res.length - 1].id : '',
        },
      };

      await this.cacheService.set(cacheKey, resultData, { EX: 60 });

      return resultData;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<TagDetailDto | null> {
    try {
      const cacheKey = generateCacheKey('Tag', { id });

      const cacheData = await this.cacheService.get<TagDetailDto>(cacheKey);
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
        throw AppError.notFound('Tag not found.');
      }

      await this.repository.delete(id);
      return id;
    } catch (error) {
      throw AppError.internalServer('Internal server error.');
    }
  }

  private _convertToResultDto(entity: TagEntity): TagDetailDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      updatedAt: entity.updatedAt,
    };
  }
}
