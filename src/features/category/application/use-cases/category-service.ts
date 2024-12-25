import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategoryUpdateDto,
  Id,
} from '../dto/category-dtos';
import { CategoryEntity } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repository/category-repository';
import { ICategoryService } from './interfaces/category-service-interface';
import logger from '@src/core/utils/logger/logger';

@injectable()
export class CategoryService implements ICategoryService {
  private readonly repository: CategoryRepository;
  constructor(
    @inject(DI_TYPES.CategoryRepository) repository: CategoryRepository,
  ) {
    this.repository = repository;
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
      throw new Error(`error: ${error}`);
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
  async getList(): Promise<Array<CategoryDetailDto>> {
    try {
      const res = await this.repository.getList();

      return res.map((entity) => this._convertToResultDto(entity));
    } catch (error) {
      logger.error(error);
      throw AppError.internalServer('Internal server error.');
    }
  }
  async getById(id: string): Promise<CategoryDetailDto | null> {
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
      await this.repository.delete(id);
      return id;
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
