import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  GetSeriesOptions,
  GetSeriesResult,
  SerieCreateDto,
  SerieDetailDto,
  SerieUpdateDto,
} from '../../dto/serie-dtos';

export interface ISerieService
  extends BaseUseCase<GetSeriesOptions, SerieDetailDto, Id> {
  getList(params: GetSeriesOptions): Promise<GetSeriesResult>;
  create(data: SerieCreateDto): Promise<SerieDetailDto>;
  update(id: Id, data: SerieUpdateDto): Promise<string>;
  getPopularSeries(
    limit: number,
    cursor: string | undefined,
  ): Promise<GetSeriesResult>;
}
