import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  SerieCreateDto,
  SerieDetailDto,
  SerieUpdateDto,
} from '../../dto/serie-dtos';

export interface ISerieService extends BaseUseCase<any, SerieDetailDto, Id> {
  create(data: SerieCreateDto): Promise<SerieDetailDto>;
  update(id: Id, data: SerieUpdateDto): Promise<string>;
}
