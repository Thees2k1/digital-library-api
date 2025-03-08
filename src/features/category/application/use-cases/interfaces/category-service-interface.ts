import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategoryUpdateDto,
  GetCategoriesParams,
  GetCategoriesResult,
  Id,
} from '@src/features/category/application/dto/category-dtos';

export interface ICategoryService
  extends BaseUseCase<GetCategoriesParams, CategoryDetailDto, Id> {
  getList(query: GetCategoriesParams): Promise<GetCategoriesResult>;
  create(data: CategoryCreateDto): Promise<CategoryDetailDto>;
  update(id: Id, data: CategoryUpdateDto): Promise<string>;
}
