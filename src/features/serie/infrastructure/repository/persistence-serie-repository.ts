import { Serie, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { SerieRepository } from '../../domain/repository/serie-repository';
import { SerieEntity } from '../../domain/entities/serie-entity';
import { GetSeriesParams } from '../../application/dto/serie-dtos';

@injectable()
export class PersistenceSerieRepository extends SerieRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  count(filter: any): Promise<number> {
    return this.prisma.serie.count({ where: filter });
  }
  async getList({ paging }: GetSeriesParams): Promise<SerieEntity[]> {
    const data: Serie[] = await this.prisma.serie.findMany({
      take: paging?.limit ?? 20,
      skip: paging?.cursor ? 1 : 0,
      ...(paging?.cursor ? { skip: 1, cursor: { id: paging.cursor } } : {}),
    });
    return data.map((Serie) =>
      PersistenceSerieRepository.convertToEntity(Serie),
    );
  }

  async getById(id: string): Promise<SerieEntity | null> {
    const data: Serie | null = await this.prisma.serie.findUnique({
      where: { id: id },
    });
    if (!data) return null;
    return PersistenceSerieRepository.convertToEntity(data);
  }

  async getByNameAsync(name: string): Promise<SerieEntity | null> {
    const data: Serie | null = await this.prisma.serie.findFirst({
      where: { name },
    });
    if (!data) return null;
    return PersistenceSerieRepository.convertToEntity(data);
  }

  async create(data: Partial<SerieEntity>): Promise<SerieEntity> {
    const mappedData = {
      id: data.id!,
      name: data.name!,
      cover: data.cover,
      releaseDate: data.releaseDate || '',
      status: data.status,
      description: data.description ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    const Serie: Serie = await this.prisma.serie.create({
      data: mappedData,
    });

    return PersistenceSerieRepository.convertToEntity(Serie);
  }

  async update(id: string, data: Partial<SerieEntity>): Promise<void> {
    const mappedData = {
      name: data.name,
      cover: data.cover,
      releaseDate: data.releaseDate,
      status: data.status,
      description: data.description ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    await this.prisma.serie.update({
      where: { id: id },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.serie.delete({ where: { id: id } });
  }

  async getBooksBySerieId(id: string): Promise<Array<String>> {
    const data = await this.prisma.book.findMany({
      where: { serieId: id },
      select: { id: true },
    });
    return data.map((book) => book.id);
  }

  static convertToEntity(data: Serie): SerieEntity {
    return new SerieEntity(
      data.id,
      data.name,
      data.cover ?? '',
      data.description ?? '',
      data.status,
      undefined,
      data.releaseDate,
      data.createdAt,
      data.updatedAt,
    );
  }
}
