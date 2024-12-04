import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import logger from '@src/core/utils/logger/logger';
import { Id } from '@src/core/types';
import { ISerieService } from './interfaces/serie-service-interface';
import { SerieRepository } from '../../domain/repository/serie-repository';
import {
  SerieCreateDto,
  SerieDetailDto,
  SerieUpdateDto,
} from '../dto/serie-dtos';
import { SerieEntity } from '../../domain/entities/serie-entity';
import { v7 as uuid } from 'uuid';

@injectable()
export class SerieService implements ISerieService {
  private readonly repository: SerieRepository;
  constructor(@inject(DI_TYPES.SerieRepository) repository: SerieRepository) {
    this.repository = repository;
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
        releaseDate: data.releaseDate ?? undefined,
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
        releaseDate: data.releaseDate ?? existed.releaseDate,
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
  async getList(): Promise<Array<SerieDetailDto>> {
    try {
      const res = await this.repository.getList();

      return res.map((entity) => this._convertToResultDto(entity));
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<SerieDetailDto | null> {
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
