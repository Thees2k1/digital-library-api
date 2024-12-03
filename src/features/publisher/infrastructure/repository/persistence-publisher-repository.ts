import { inject, injectable } from 'inversify';
import { PublisherRepository } from '../../domain/repository/publisher-repository';
import { PrismaClient, Publisher } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { PublisherEntity } from '../../domain/entities/publisher-entity';
import { binaryToUuid, uuidToBinary } from '@src/core/utils/utils';

@injectable()
export class PersistencePublisherRepository extends PublisherRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async getList(): Promise<PublisherEntity[]> {
    const data: Publisher[] = await this.prisma.publisher.findMany();
    return data.map((publisher) =>
      PersistencePublisherRepository.convertToEntity(publisher),
    );
  }

  async getById(id: string): Promise<PublisherEntity | null> {
    const data: Publisher | null = await this.prisma.publisher.findUnique({
      where: { id: uuidToBinary(id) },
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
      where: { id: uuidToBinary(id) },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.publisher.delete({ where: { id: uuidToBinary(id) } });
  }

  static convertToEntity(data: Publisher): PublisherEntity {
    return new PublisherEntity(
      binaryToUuid(data.id),
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
      return { ...required, id: uuidToBinary(data.id) };
    }
    return required;
  }
}
