import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategoryUpdateDto,
  Id,
} from '@src/features/category/application/dto/category-dtos';

export interface ICategoryService
  extends BaseUseCase<any, CategoryDetailDto, Id> {
  create(data: CategoryCreateDto): Promise<CategoryDetailDto>;
  update(id: Id, data: CategoryUpdateDto): Promise<string>;
}
