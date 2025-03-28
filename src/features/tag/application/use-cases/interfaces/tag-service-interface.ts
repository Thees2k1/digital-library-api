import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  TagCreateDto,
  TagDetailDto,
  TagUpdateDto,
  GetTagsParams,
  GetTagsResult,
} from '../../dto/tag-dtos';

export interface ITagService extends BaseUseCase<any, TagDetailDto, Id> {
  getList(params: GetTagsParams): Promise<GetTagsResult>;
  create(data: TagCreateDto): Promise<TagDetailDto>;
  update(id: Id, data: TagUpdateDto): Promise<string>;
}
