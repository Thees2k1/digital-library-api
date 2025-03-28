import { Genre, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { GenreRepository } from '../../domain/repository/genre-repository';
import { GenreEntity } from '../../domain/entities/genre-entity';
import { GetGenresParams } from '../../application/dto/genre-dtos';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class PersistenceGenreRepository extends GenreRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  count(filter: any): Promise<number> {
    return this.prisma.genre.count({ where: filter });
  }

  async getList({ paging, sort }: GetGenresParams): Promise<GenreEntity[]> {
    const data: Genre[] = await this.prisma.genre.findMany({
      take: paging?.limit ?? DEFAULT_LIST_LIMIT,
      skip: paging?.cursor ? 1 : 0,
      ...(paging?.cursor ? { skip: 1, cursor: { id: paging.cursor } } : {}),
      ...(sort ? { orderBy: [{ [sort.field]: sort.order }] } : {}),
    });
    return data.map((Genre) =>
      PersistenceGenreRepository.convertToEntity(Genre),
    );
  }

  async getById(id: string): Promise<GenreEntity | null> {
    const data: Genre | null = await this.prisma.genre.findUnique({
      where: { id: id },
    });
    if (!data) return null;
    return PersistenceGenreRepository.convertToEntity(data);
  }

  async getByNameAsync(name: string): Promise<GenreEntity | null> {
    const data: Genre | null = await this.prisma.genre.findFirst({
      where: { name },
    });
    if (!data) return null;
    return PersistenceGenreRepository.convertToEntity(data);
  }

  async create(data: Partial<GenreEntity>): Promise<GenreEntity> {
    const mappedData = PersistenceGenreRepository.convertToDbModel(data);
    const Genre: Genre = await this.prisma.genre.create({
      data: mappedData,
    });

    return PersistenceGenreRepository.convertToEntity(Genre);
  }

  async update(id: string, data: Partial<GenreEntity>): Promise<void> {
    const mappedData = PersistenceGenreRepository.convertToDbModel(data);
    await this.prisma.genre.update({
      where: { id: id },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.genre.delete({ where: { id: id } });
  }

  static convertToEntity(data: Genre): GenreEntity {
    return new GenreEntity(
      data.id,
      data.name,
      data.description ?? '',
      data.createdAt,
      data.updatedAt,
    );
  }
  static convertToDbModel(data: Partial<GenreEntity>) {
    const required = {
      name: data.name ?? '',
      description: data.description ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    if (data.id) {
      return { ...required, id: data.id };
    }
    return required;
  }
}
