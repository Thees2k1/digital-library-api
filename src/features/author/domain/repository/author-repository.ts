import { Repository } from '@src/core/interfaces/base-repository';
import { AuthorEntity } from '../entities/author-entity';

export interface AuthorRepository extends Repository<string, AuthorEntity> {
  // getById(id: string): Promise<AuthorEntity | null>;
  // create(data: Partial<AuthorEntity>): Promise<AuthorEntity>;
  // update(id: string, data: Partial<AuthorEntity>): Promise<void>;
  // delete(id: string): Promise<void>;
  getByName(name: string): Promise<AuthorEntity | null>;
}
