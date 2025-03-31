import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';

import { Id } from '@src/core/types';
import logger from '@src/core/utils/logger/logger';
import { PublisherEntity } from '../../domain/entities/publisher-entity';
import { PublisherRepository } from '../../domain/repository/publisher-repository';
import {
  GetPublishersOptions,
  GetPublishersResult,
  PublisherCreateDto,
  PublisherDetailDto,
  PublisherUpdateDto,
} from '../dto/publisher-dtos';
import { IPublisherService } from './interfaces/publisher-service-interface';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class PublisherService implements IPublisherService {
  private readonly repository: PublisherRepository;
  constructor(
    @inject(DI_TYPES.PublisherRepository) repository: PublisherRepository,
  ) {
    this.repository = repository;
  }
  async create(data: PublisherCreateDto): Promise<PublisherDetailDto> {
    try {
      const existed = await this.repository.getByNameAsync(data.name);
      if (existed) {
        throw AppError.forbidden('existed Publisher.');
      }

      const res = await this.repository.create(data);

      return this._convertToResultDto(res);
    } catch (error) {
      logger.error(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalServer('Internal server error.');
    }
  }
  async update(id: Id, data: PublisherUpdateDto): Promise<string> {
    try {
      const existed = await this.repository.getById(id);
      if (!existed) {
        throw AppError.notFound('Publisher not found.');
      }

      await this.repository.update(id, { ...existed, ...data });
      return existed.id;
    } catch (error) {
      throw error;
    }
  }
  async getList(options: GetPublishersOptions): Promise<GetPublishersResult> {
    try {
      const res = await this.repository.getList(options);
      const total = await this.repository.count(options.filter ?? {});
      const limit = options.paging?.limit ?? DEFAULT_LIST_LIMIT;
      const hasNextPage = res.length >= limit;
      const nextCursor = hasNextPage ? res[res.length - 1].id : '';
      const publishers = res.map((entity) => this._convertToResultDto(entity));
      const result: GetPublishersResult = {
        data: publishers,
        paging: {
          total,
          limit,
          nextCursor,
        },
      };
      return result;
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<PublisherDetailDto | null> {
    try {
      const res = await this.repository.getById(id);

      if (!res) {
        return null;
      }

      return this._convertToResultDto(res);
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async delete(id: string): Promise<string> {
    try {
      const res = await this.repository.getById(id);

      if (!res) {
        throw AppError.notFound('Publisher not found.');
      }
      await this.repository.delete(id);
      return id;
    } catch (error) {
      throw error;
    }
  }

  private _convertToResultDto(entity: PublisherEntity): PublisherDetailDto {
    return {
      id: entity.id,
      name: entity.name,
      cover: entity.cover,
      address: entity.address,
      contactInfo: entity.contactInfo,
      updatedAt: entity.updatedAt,
    };
  }
}
