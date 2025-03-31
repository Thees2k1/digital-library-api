import { Tag, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { TagRepository } from '../../domain/repository/tag-repository';
import { TagEntity } from '../../domain/entities/tag-entity';
import { GetTagsOptions, TagFilters } from '../../application/dto/tag-dtos';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';

@injectable()
export class PersistenceTagRepository extends TagRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  count(filter: TagFilters): Promise<number> {
    return this.prisma.tag.count({
      where: {
        ...(filter?.name ? { name: { contains: filter.name } } : {}),
      },
    });
  }

  async getList({
    paging,
    sort,
    filter,
  }: GetTagsOptions): Promise<TagEntity[]> {
    const data: Tag[] = await this.prisma.tag.findMany({
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
    return data.map((Tag) => PersistenceTagRepository.convertToEntity(Tag));
  }

  async getById(id: string): Promise<TagEntity | null> {
    const data: Tag | null = await this.prisma.tag.findUnique({
      where: { id: id },
    });
    if (!data) return null;
    return PersistenceTagRepository.convertToEntity(data);
  }

  async getByNameAsync(name: string): Promise<TagEntity | null> {
    const data: Tag | null = await this.prisma.tag.findFirst({
      where: { name },
    });
    if (!data) return null;
    return PersistenceTagRepository.convertToEntity(data);
  }

  async create(data: Partial<TagEntity>): Promise<TagEntity> {
    const mappedData = PersistenceTagRepository.convertToDbModel(data);
    const Tag: Tag = await this.prisma.tag.create({
      data: mappedData,
    });

    return PersistenceTagRepository.convertToEntity(Tag);
  }

  async update(id: string, data: Partial<TagEntity>): Promise<void> {
    const mappedData = PersistenceTagRepository.convertToDbModel(data);
    await this.prisma.tag.update({
      where: { id: id },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id: id } });
  }

  static convertToEntity(data: Tag): TagEntity {
    return new TagEntity(
      data.id,
      data.name,
      data.description ?? '',
      data.createdAt,
      data.updatedAt,
    );
  }
  static convertToDbModel(data: Partial<TagEntity>) {
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
