import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategoryUpdateDto,
  GetCategoriesOptions,
  GetCategoriesResult,
  Id,
} from '@src/features/category/application/dto/category-dtos';

export interface ICategoryService
  extends BaseUseCase<GetCategoriesOptions, CategoryDetailDto, Id> {
  getList(query: GetCategoriesOptions): Promise<GetCategoriesResult>;
  create(data: CategoryCreateDto): Promise<CategoryDetailDto>;
  update(id: Id, data: CategoryUpdateDto): Promise<string>;
  getPopularCategories(
    query: GetCategoriesOptions,
  ): Promise<GetCategoriesResult>;
}
