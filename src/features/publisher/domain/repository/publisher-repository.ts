import { Repository } from '@src/core/interfaces/base-repository';
import { Id } from '@src/core/types';
import { PublisherEntity } from '../entities/publisher-entity';
import {
  GetPublishersOptions,
  PublisherFilters,
} from '../../application/dto/publisher-dtos';

export abstract class PublisherRepository
  implements Repository<Id, PublisherEntity, GetPublishersOptions>
{
  getList(options: GetPublishersOptions): Promise<PublisherEntity[]> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<PublisherEntity | null> {
    throw new Error('Method not implemented.');
  }
  create(data: Partial<PublisherEntity>): Promise<PublisherEntity> {
    throw new Error('Method not implemented.');
  }
  update(id: string, data: Partial<PublisherEntity>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getByNameAsync(name: string): Promise<null | PublisherEntity> {
    throw new Error('Method not implemented,');
  }
  count(filter: PublisherFilters): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
