import { Repository } from '@src/core/interfaces/base-repository';
import { Id } from '@src/core/types';
import { SerieEntity } from '../entities/serie-entity';
import { GetSeriesParams } from '../../application/dto/serie-dtos';

export abstract class SerieRepository implements Repository<Id, SerieEntity> {
  getList(params: GetSeriesParams): Promise<Array<SerieEntity>> {
    throw new Error('Method not implemented.');
  }
  getById(id: string): Promise<SerieEntity | null> {
    throw new Error('Method not implemented.');
  }
  create(data: Partial<SerieEntity>): Promise<SerieEntity> {
    throw new Error('Method not implemented.');
  }
  update(id: string, data: Partial<SerieEntity>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getByNameAsync(name: string): Promise<null | SerieEntity> {
    throw new Error('Method not implemented,');
  }

  getBooksBySerieId(id: string): Promise<Array<String>> {
    throw new Error('Method not implemented.');
  }

  abstract count(filter: any): Promise<number>;
}
