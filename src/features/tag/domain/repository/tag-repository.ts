import { Repository } from '@src/core/interfaces/base-repository';
import { Id } from '@src/core/types';
import { GetTagsOptions, TagFilters } from '../../application/dto/tag-dtos';
import { TagEntity } from '../entities/tag-entity';

export abstract class TagRepository
  implements Repository<Id, TagEntity, GetTagsOptions>
{
  getList(params: GetTagsOptions): Promise<TagEntity[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<TagEntity | null> {
    throw new Error('Method not implemented.');
  }
  create(data: Partial<TagEntity>): Promise<TagEntity> {
    throw new Error('Method not implemented.');
  }
  update(id: string, data: Partial<TagEntity>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getByNameAsync(name: string): Promise<null | TagEntity> {
    throw new Error('Method not implemented,');
  }

  count(filter: TagFilters): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
