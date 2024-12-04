import { Interactor } from '@src/core/interfaces/base-interactor';

import { Id } from '@src/core/types';
import {
  SerieCreateDto,
  SerieDetailDto,
  SerieUpdateDto,
} from '../../dto/serie-dtos';

export interface ISerieService extends Interactor<SerieDetailDto, Id> {
  create(data: SerieCreateDto): Promise<SerieDetailDto>;
  update(id: Id, data: SerieUpdateDto): Promise<string>;
}
