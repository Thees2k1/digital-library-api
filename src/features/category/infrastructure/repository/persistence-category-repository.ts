import { Category, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { CategoryEntity } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repository/category-repository';

@injectable()
export class PersistenceCategoryRepository extends CategoryRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async getList(): Promise<CategoryEntity[]> {
    const data: Category[] = await this.prisma.category.findMany();
    return data.map((category) =>
      PersistenceCategoryRepository.convertToEntity(category),
    );
  }

  async getById(id: string): Promise<CategoryEntity | null> {
    const data: Category | null = await this.prisma.category.findUnique({
      where: { id: id },
    });
    if (!data) return null;
    return PersistenceCategoryRepository.convertToEntity(data);
  }

  async getByNameAsync(name: string): Promise<CategoryEntity | null> {
    const data: Category | null = await this.prisma.category.findFirst({
      where: { name },
    });
    if (!data) return null;
    return PersistenceCategoryRepository.convertToEntity(data);
  }

  async create(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const mappedData = PersistenceCategoryRepository.convertToDbModel(data);
    const category: Category = await this.prisma.category.create({
      data: mappedData,
    });

    return PersistenceCategoryRepository.convertToEntity(category);
  }

  async update(id: string, data: Partial<CategoryEntity>): Promise<void> {
    const mappedData = PersistenceCategoryRepository.convertToDbModel(data);
    await this.prisma.category.update({
      where: { id: id },
      data: mappedData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id: id } });
  }

  static convertToEntity(data: Category): CategoryEntity {
    return new CategoryEntity(
      data.id,
      data.name,
      data.cover ?? '',
      data.description ?? '',
      data.createdAt,
      data.updatedAt,
    );
  }
  static convertToDbModel(data: Partial<CategoryEntity>) {
    const required = {
      name: data.name ?? '',
      cover: data.cover,
      description: data.description ?? null,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    };
    if (data.id) {
      return { ...required, id: data.id };
    }
    return required;
  }
}
