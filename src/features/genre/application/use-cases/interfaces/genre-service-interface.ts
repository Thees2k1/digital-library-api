import { Interactor } from '@src/core/interfaces/base-interactor';
import {
  GenreCreateDto,
  GenreDetailDto,
  GenreUpdateDto,
} from '../../dto/genre-dtos';
import { Id } from '@src/core/types';

export interface IGenreService extends Interactor<GenreDetailDto, Id> {
  create(data: GenreCreateDto): Promise<GenreDetailDto>;
  update(id: Id, data: GenreUpdateDto): Promise<string>;
}
