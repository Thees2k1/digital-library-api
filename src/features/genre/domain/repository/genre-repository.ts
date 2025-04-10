import { Repository } from '@src/core/interfaces/base-repository';
import { GenreEntity } from '../entities/genre-entity';
import { GetListOptions, Id } from '@src/core/types';
import {
  GenreFilters,
  GetGenresOptions,
} from '../../application/dto/genre-dtos';

export abstract class GenreRepository
  implements Repository<Id, GenreEntity, GetGenresOptions>
{
  getList(params: GetGenresOptions): Promise<GenreEntity[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<GenreEntity | null> {
    throw new Error('Method not implemented.');
  }
  create(data: Partial<GenreEntity>): Promise<GenreEntity> {
    throw new Error('Method not implemented.');
  }
  update(id: string, data: Partial<GenreEntity>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getByNameAsync(name: string): Promise<null | GenreEntity> {
    throw new Error('Method not implemented,');
  }

  count(filter: GenreFilters): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
