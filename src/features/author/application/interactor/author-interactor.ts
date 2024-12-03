import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { v7 as uuid } from 'uuid';
import { AuthorRepository } from '../../domain/repository/author-repository';
import {
  AuthorCreateDto,
  AuthorDetailDto,
  AuthorIdDto,
  AuthorIdResultDto,
  AuthorList,
  AuthorUpdateDto,
} from '../dtos/author-dto';
import { AuthorMapper } from '../mapper/author-mapper';
import { IAuthorInteractor } from './interfaces/interactor';
import { AppError } from '@src/core/errors/custom-error';

@injectable()
export class AuthorInteractor implements IAuthorInteractor {
  private readonly repository: AuthorRepository;
  constructor(@inject(DI_TYPES.AuthorRepository) repository: AuthorRepository) {
    this.repository = repository;
  }

  async getList(): Promise<AuthorList> {
    //TODO: Implement pagination
    //TODO: Implement filtering
    const res = await this.repository.getList();
    const data: AuthorList = res.map((author) => {
      return AuthorMapper.toAuthorDetailDto(author);
    });
    return data;
  }

  async getById(id: AuthorIdDto): Promise<AuthorDetailDto | null> {
    const res = await this.repository.getById(id);
    if (!res) {
      return null;
    }
    return AuthorMapper.toAuthorDetailDto(res);
  }

  async create(author: AuthorCreateDto): Promise<AuthorDetailDto> {
    const existedAuthor = await this.repository.getByName(author.name);

    if (existedAuthor) {
      throw AppError.forbidden('Author already exists');
    }

    const newAuthor = await this.repository.create({
      ...author,
      id: uuid(),
    });

    return AuthorMapper.toAuthorDetailDto(newAuthor);
  }

  async update(
    id: AuthorIdDto,
    author: AuthorUpdateDto,
  ): Promise<AuthorIdResultDto> {
    const existedAuthor = await this.repository.getById(id);
    if (!existedAuthor) {
      throw AppError.notFound('Author not found');
    }

    const updatedAuthor = existedAuthor.copyWith({
      ...author,
      updatedAt: new Date(),
    });
    await this.repository.update(id, updatedAuthor);
    return id;
  }

  async delete(id: string): Promise<AuthorIdResultDto> {
    const existedAuthor = await this.repository.getById(id);
    if (!existedAuthor) {
      throw AppError.notFound('Author not found');
    }
    await this.repository.delete(id);
    return id;
  }
}
