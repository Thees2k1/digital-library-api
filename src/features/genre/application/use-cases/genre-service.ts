import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import {
  GenreCreateDto,
  GenreDetailDto,
  GenreUpdateDto,
} from '../dto/genre-dtos';
import logger from '@src/core/utils/logger/logger';
import { GenreRepository } from '../../domain/repository/genre-repository';
import { IGenreService } from './interfaces/genre-service-interface';
import { GenreEntity } from '../../domain/entities/genre-entity';
import { Id } from '@src/core/types';

@injectable()
export class GenreService implements IGenreService {
  private readonly repository: GenreRepository;
  constructor(@inject(DI_TYPES.GenreRepository) repository: GenreRepository) {
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
      throw new Error(`error: ${error}`);
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
  async getList(): Promise<Array<GenreDetailDto>> {
    try {
      const res = await this.repository.getList();

      return res.map((entity) => this._convertToResultDto(entity));
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<GenreDetailDto | null> {
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
        throw AppError.notFound('Genre not found.');
      }

      await this.repository.delete(id);
      return id;
    } catch (error) {
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
