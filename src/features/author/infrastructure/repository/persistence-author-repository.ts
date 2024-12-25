import { Author, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { binaryToUuid, uuidToBinary } from '@src/core/utils/utils';
import { inject, injectable } from 'inversify';
import { AuthorEntity } from '../../domain/entities/author-entity';
import { AuthorRepository } from '../../domain/repository/author-repository';

@injectable()
export class PersistenceAuthorRepository implements AuthorRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getList(): Promise<AuthorEntity[]> {
    const data: Author[] = await this.prisma.author.findMany();
    return data.map(PersistenceAuthorRepository.convertToAuthorEntity);
  }
  async getById(id: string): Promise<AuthorEntity | null> {
    const data: Author | null = await this.prisma.author.findUnique({
      where: { id: uuidToBinary(id) },
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
      where: { id: uuidToBinary(id) },
      data: mappedData,
    });
  }
  async delete(id: string): Promise<void> {
    await this.prisma.author.delete({ where: { id: uuidToBinary(id) } });
  }

  static convertToAuthorEntity(data: Author): AuthorEntity {
    return new AuthorEntity(
      binaryToUuid(data.id),
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
    return { ...required, id: uuidToBinary(data.id) };
  }
}
