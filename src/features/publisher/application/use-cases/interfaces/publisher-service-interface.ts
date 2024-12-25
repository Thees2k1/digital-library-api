import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  PublisherCreateDto,
  PublisherDetailDto,
  PublisherUpdateDto,
} from '../../dto/publisher-dtos';

export interface IPublisherService
  extends BaseUseCase<any, PublisherDetailDto, Id> {
  create(data: PublisherCreateDto): Promise<PublisherDetailDto>;
  update(id: Id, data: PublisherUpdateDto): Promise<string>;
}
