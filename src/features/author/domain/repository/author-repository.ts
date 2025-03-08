import { Repository } from '@src/core/interfaces/base-repository';
import { AuthorEntity } from '../entities/author-entity';

export interface AuthorRepository extends Repository<string, AuthorEntity> {
  getByName(name: string): Promise<AuthorEntity | null>;
  count(filter: any): Promise<number>;
}
