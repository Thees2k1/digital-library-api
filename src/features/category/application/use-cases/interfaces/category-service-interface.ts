import { Interactor } from '@src/core/interfaces/base-interactor';
import {
  CategoryCreateDto,
  CategoryDetailDto,
  CategoryUpdateDto,
  Id,
} from '@src/features/category/application/dto/category-dtos';

export interface ICategoryService extends Interactor<CategoryDetailDto, Id> {
  create(data: CategoryCreateDto): Promise<CategoryDetailDto>;
  update(id: Id, data: CategoryUpdateDto): Promise<string>;
}
