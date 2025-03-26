import { Author, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { AuthorEntity } from '../../domain/entities/author-entity';
import { AuthorRepository } from '../../domain/repository/author-repository';
import { GetListOptions } from '@src/core/types';

@injectable()
export class PersistenceAuthorRepository implements AuthorRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async count(filter: any): Promise<number> {
    //NEED TO IMPROVE
    return await this.prisma.author.count({ where: filter });
  }
  async getList({
    paging,
  }: GetListOptions<AuthorEntity>): Promise<AuthorEntity[]> {
    const data: Author[] = await this.prisma.author.findMany({
      take: paging?.limit ?? 20,
      skip: paging?.cursor ? 1 : 0,
      ...(paging?.cursor ? { skip: 1, cursor: { id: paging.cursor } } : {}),
    });
    return data.map(PersistenceAuthorRepository.convertToAuthorEntity);
  }

  async getById(id: string): Promise<AuthorEntity | null> {
    const data: Author | null = await this.prisma.author.findUnique({
      where: { id: id },
    });
    if (!data) return null;
    return PersistenceAuthorRepository.convertToAuthorEntity(data);
  }

  async getByName(name: string): Promise<AuthorEntity | null> {
    const data: Author | null = await this.prisma.author.findFirst({
      where: { name },
    });
    return data
      ? PersistenceAuthorRepository.convertToAuthorEntity(data)
      : null;
  }

  async create(data: Partial<AuthorEntity>): Promise<AuthorEntity> {
    const mappedData = PersistenceAuthorRepository.convertToDbModel(data);
    const author: Author = await this.prisma.author.create({
      data: mappedData,
    });

    return PersistenceAuthorRepository.convertToAuthorEntity(author);
  }
  async update(id: string, data: Partial<AuthorEntity>): Promise<void> {
    const mappedData = PersistenceAuthorRepository.convertToDbModel(data);
    await this.prisma.author.update({
      where: { id: id },
      data: mappedData,
    });
  }
  async delete(id: string): Promise<void> {
    await this.prisma.author.delete({ where: { id: id } });
  }

  async getPopularAuthors(
    limit: number,
    cursor?: string,
  ): Promise<{ authors: AuthorEntity[]; nextCursor: string | null }> {
    const data = await this.prisma.author.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { popularityPoints: 'desc' },
    });

    const authors = data
      .slice(0, limit)
      .map(PersistenceAuthorRepository.convertToAuthorEntity);
    const nextCursor = data.length > limit ? data[limit].id : null;

    return { authors, nextCursor };
  }

  async updatePopularityPoints(
    authorId: string,
    points: number,
  ): Promise<void> {
    await this.prisma.author.update({
      where: { id: authorId },
      data: { popularityPoints: points },
    });
  }
  async getAll(): Promise<AuthorEntity[]> {
    const data: Author[] = await this.prisma.author.findMany();
    return data.map(PersistenceAuthorRepository.convertToAuthorEntity);
  }

  static convertToAuthorEntity(data: Author): AuthorEntity {
    return new AuthorEntity(
      data.id,
      data.name,
      data.avatar,
      data.birthDate,
      data.deathDate,
      data.country || '',
      data.bio || '',
      data.createdAt,
      data.updatedAt,
      [],
    );
  }
  static convertToDbModel(data: Partial<AuthorEntity>) {
    const required = {
      name: data.name!,
      avatar: data.avatar ?? null,
      birthDate: data.birthDate!,
      deathDate: data.deathDate ?? null,
      country: data.country ?? null,
      bio: data.bio ?? null,
    };
    if (!data.id) return required;
    return { ...required, id: data.id };
  }
}
