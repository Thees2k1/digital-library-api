import { Interactor } from '@src/core/interfaces/base-interactor';
import {
  PublisherCreateDto,
  PublisherDetailDto,
  PublisherUpdateDto,
} from '../../dto/publisher-dtos';
import { Id } from '@src/core/types';

export interface IPublisherService extends Interactor<PublisherDetailDto, Id> {
  create(data: PublisherCreateDto): Promise<PublisherDetailDto>;
  update(id: Id, data: PublisherUpdateDto): Promise<string>;
}
