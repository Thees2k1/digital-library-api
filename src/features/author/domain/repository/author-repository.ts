import { Repository } from '@src/core/interfaces/base-repository';
import { AuthorEntity } from '../entities/author-entity';
import { GetAuthorsOptions } from '../../application/dtos/author-dto';

export interface AuthorRepository
  extends Repository<string, AuthorEntity, GetAuthorsOptions> {
  getByName(name: string): Promise<AuthorEntity | null>;
  count(filter: any): Promise<number>;
  getPopularAuthors(
    limit: number,
    cursor?: string,
  ): Promise<{ authors: AuthorEntity[]; nextCursor: string | null }>;
  updatePopularityPoints(authorId: string, points: number): Promise<void>;
  getAll(): Promise<AuthorEntity[]>;
}
