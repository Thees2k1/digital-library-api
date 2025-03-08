import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  GetSeriesParams,
  GetSeriesResult,
  SerieCreateDto,
  SerieDetailDto,
  SerieUpdateDto,
} from '../../dto/serie-dtos';

export interface ISerieService
  extends BaseUseCase<GetSeriesParams, SerieDetailDto, Id> {
  getList(params: GetSeriesParams): Promise<GetSeriesResult>;
  create(data: SerieCreateDto): Promise<SerieDetailDto>;
  update(id: Id, data: SerieUpdateDto): Promise<string>;
}
