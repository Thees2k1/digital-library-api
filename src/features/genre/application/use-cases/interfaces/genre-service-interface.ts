import { BaseUseCase } from '@src/core/interfaces/base-use-case';
import { Id } from '@src/core/types';
import {
  GenreCreateDto,
  GenreDetailDto,
  GenreUpdateDto,
  GetGenresOptions,
  GetGenresResult,
} from '../../dto/genre-dtos';

export interface IGenreService extends BaseUseCase<any, GenreDetailDto, Id> {
  getList(params: GetGenresOptions): Promise<GetGenresResult>;
  create(data: GenreCreateDto): Promise<GenreDetailDto>;
  update(id: Id, data: GenreUpdateDto): Promise<string>;
}
