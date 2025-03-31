import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  TagCreateDto,
  TagDetailDto,
  TagUpdateDto,
  GetTagsOptions,
  GetTagsResult,
} from '../../dto/tag-dtos';

export interface ITagService
  extends BaseUseCase<GetTagsOptions, TagDetailDto, Id> {
  getList(params: GetTagsOptions): Promise<GetTagsResult>;
  create(data: TagCreateDto): Promise<TagDetailDto>;
  update(id: Id, data: TagUpdateDto): Promise<string>;
}
