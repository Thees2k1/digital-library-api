import { Repository } from '@src/core/interfaces/base-repository';
import { GetListOptions } from '@src/core/types';
import { Id } from '../../application/dto/category-dtos';
import { CategoryEntity } from '../entities/category';

export abstract class CategoryRepository
  implements Repository<Id, CategoryEntity>
{
  getList(options: GetListOptions<CategoryEntity>): Promise<CategoryEntity[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<CategoryEntity | null> {
    throw new Error('Method not implemented.');
  }
  create(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    throw new Error('Method not implemented.');
  }
  update(id: string, data: Partial<CategoryEntity>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getByNameAsync(name: string): Promise<null | CategoryEntity> {
    throw new Error('Method not implemented,');
  }

  abstract getAll(): Promise<CategoryEntity[]>;

  abstract count(filter: any): Promise<number>;

  abstract updatePopularityPoints(
    categoryId: string,
    points: number,
  ): Promise<void>;
}
