import { Genre, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { binaryToUuid, uuidToBinary } from '@src/core/utils/utils';
import { inject, injectable } from 'inversify';
import { GenreRepository } from '../../domain/repository/genre-repository';
import { GenreEntity } from '../../domain/entities/genre-entity';

@injectable()
export class PersistenceGenreRepository extends GenreRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async getList(): Promise<GenreEntity[]> {
    const data: Genre[] = await this.prisma.genre.findMany();
    return data.map((Genre) =>
      PersistenceGenreRepository.convertToEntity(Genre),
    );
  }

  async getById(id: string): Promise<GenreEntity | null> {
    const data: Genre | null = await this.prisma.genre.findUnique({
      where: { id: uuidToBinary(id) },
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
      where: { id: uuidToBinary(id) },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.genre.delete({ where: { id: uuidToBinary(id) } });
  }

  static convertToEntity(data: Genre): GenreEntity {
    return new GenreEntity(
      binaryToUuid(data.id),
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
      return { ...required, id: uuidToBinary(data.id) };
    }
    return required;
  }
}
