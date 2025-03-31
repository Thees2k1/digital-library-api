import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  GetPublishersOptions,
  GetPublishersResult,
  PublisherCreateDto,
  PublisherDetailDto,
  PublisherUpdateDto,
} from '../../dto/publisher-dtos';

export interface IPublisherService
  extends BaseUseCase<GetPublishersOptions, PublisherDetailDto, Id> {
  getList(options: GetPublishersOptions): Promise<GetPublishersResult>;
  create(data: PublisherCreateDto): Promise<PublisherDetailDto>;
  update(id: Id, data: PublisherUpdateDto): Promise<string>;
}
