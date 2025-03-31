import { PrismaClient, Serie } from '@prisma/client';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import {
  GetSeriesOptions,
  SerieStatus,
} from '../../application/dto/serie-dtos';
import { SerieEntity } from '../../domain/entities/serie-entity';
import { SerieRepository } from '../../domain/repository/serie-repository';

@injectable()
export class PersistenceSerieRepository extends SerieRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  count(filter: any): Promise<number> {
    return this.prisma.serie.count({
      where: {
        ...(filter?.name ? { name: { contains: filter.name } } : {}),
        ...(filter?.status ? { status: filter.status } : {}),
      },
    });
  }
  async getList({
    paging,
    sort,
    filter,
  }: GetSeriesOptions): Promise<SerieEntity[]> {
    const data = await this.prisma.serie.findMany({
      include: {
        books: {
          select: {
            id: true,
            title: true,
            cover: true,
            popularityPoints: true,
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      where: {
        ...(filter?.name ? { name: { contains: filter.name } } : {}),
        ...(filter?.status ? { status: filter.status as SerieStatus } : {}),
      },
      orderBy: sort?.field
        ? [
            { [sort.field as unknown as string]: sort.order },
            { id: sort.order },
          ]
        : { createdAt: 'asc' },
      take: paging?.limit ?? DEFAULT_LIST_LIMIT,
      skip: paging?.cursor ? 1 : 0,
      ...(paging?.cursor ? { skip: 1, cursor: { id: paging.cursor } } : {}),
    });
    return data.map((Serie) =>
      PersistenceSerieRepository.convertToEntity(Serie),
    );
  }

  async updatePopularityPoints(
    id: string,
    popularityPoints: number,
  ): Promise<void> {
    await this.prisma.serie.update({
      where: { id },
      data: { popularityPoints },
    });
  }

  async getAll(): Promise<SerieEntity[]> {
    const data = await this.prisma.serie.findMany({
      select: {
        id: true,
        name: true,
        cover: true,
        description: true,
        status: true,
        releaseDate: true,
        createdAt: true,
        updatedAt: true,
        books: {
          select: {
            id: true,
            title: true,
            cover: true,
            description: true,
            status: true,
            popularityPoints: true,
            releaseDate: true,
          },
        },
      },
    });
    const series = data.map((Serie) => {
      const newSerie = PersistenceSerieRepository.convertToEntity(Serie);
      newSerie.books = Serie.books.map((book) => ({
        id: book.id,
        title: book.title,
        cover: book.cover,
        popularityPoints: book.popularityPoints ?? 0,
      }));
      return newSerie;
    });

    return series;
  }

  async getById(id: string): Promise<SerieEntity | null> {
    const data: Serie | null = await this.prisma.serie.findUnique({
      where: { id: id },
      include: { books: true },
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
    if (data.books) {
      await this.prisma.book.updateMany({
        where: { id: { in: data.books.map((book) => book.id) } },
        data: { serieId: Serie.id },
      });
    }

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

    if (data.books) {
      await this.prisma.book.updateMany({
        where: { id: { in: data.books.map((book) => book.id) } },
        data: { serieId: id },
      });
    }
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

  static convertToEntity(data: any): SerieEntity {
    const author = data.books
      ? {
          id: data.books[0]?.author.id ?? '',
          name: data.books[0]?.author.name ?? '',
          avatar: data.books[0]?.author.avatar ?? null,
        }
      : undefined;

    const books = data.books
      ? data.books.map((book: any) => ({
          id: book.id,
          title: book.title,
          cover: book.cover,
          popularityPoints: book.popularityPoints ?? 0,
        }))
      : [];

    return new SerieEntity(
      data.id,
      data.name,
      data.cover ?? '',
      data.description ?? '',
      data.status,
      author,
      books,
      data.releaseDate,
      data.createdAt,
      data.updatedAt,
    );
  }
}
