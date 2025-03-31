import { inject, injectable } from 'inversify';
import { PublisherRepository } from '../../domain/repository/publisher-repository';
import { PrismaClient, Publisher } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { PublisherEntity } from '../../domain/entities/publisher-entity';
import {
  GetPublishersOptions,
  PublisherFilters,
} from '../../application/dto/publisher-dtos';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class PersistencePublisherRepository extends PublisherRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async count(filter: PublisherFilters): Promise<number> {
    return await this.prisma.publisher.count({
      where: {
        ...(filter?.name ? { name: { contains: filter.name } } : {}),
      },
    });
  }
  async getList({
    filter,
    sort,
    paging,
  }: GetPublishersOptions): Promise<PublisherEntity[]> {
    const data: Publisher[] = await this.prisma.publisher.findMany({
      where: {
        ...(filter?.name ? { name: { contains: filter.name } } : {}),
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
    return data.map((publisher) =>
      PersistencePublisherRepository.convertToEntity(publisher),
    );
  }

  async getById(id: string): Promise<PublisherEntity | null> {
    const data: Publisher | null = await this.prisma.publisher.findUnique({
      where: { id: id },
    });
    if (!data) return null;
    return PersistencePublisherRepository.convertToEntity(data);
  }

  async getByNameAsync(name: string): Promise<PublisherEntity | null> {
    const data: Publisher | null = await this.prisma.publisher.findFirst({
      where: { name },
    });
    if (!data) return null;
    return PersistencePublisherRepository.convertToEntity(data);
  }

  async create(data: Partial<PublisherEntity>): Promise<PublisherEntity> {
    const mappedData = PersistencePublisherRepository.convertToDbModel(data);
    const Publisher: Publisher = await this.prisma.publisher.create({
      data: mappedData,
    });

    return PersistencePublisherRepository.convertToEntity(Publisher);
  }

  async update(id: string, data: Partial<PublisherEntity>): Promise<void> {
    const mappedData = PersistencePublisherRepository.convertToDbModel(data);
    await this.prisma.publisher.update({
      where: { id: id },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.publisher.delete({ where: { id: id } });
  }

  static convertToEntity(data: Publisher): PublisherEntity {
    return new PublisherEntity(
      data.id,
      data.name,
      data.cover,
      data.contactInfo,
      data.address,
      data.updatedAt,
      data.createdAt,
    );
  }
  static convertToDbModel(data: Partial<PublisherEntity>) {
    const required = {
      name: data.name ?? '',
      cover: data.cover ?? null,
      contactInfo: data.contactInfo ?? '',
      address: data.address ?? '',
      createdAt: data.createdAt ?? undefined,
      updatedAt: data.updatedAt ?? undefined,
    };
    if (data.id) {
      return { ...required, id: data.id };
    }
    return required;
  }
}
