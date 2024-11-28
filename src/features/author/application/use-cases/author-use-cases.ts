import { DI_TYPES } from '@src/core/di/types';
import { inject, injectable } from 'inversify';
import { IAuthorOutputPort, IAuthorUseCases } from './interface';
import {
  AuthorIdDto,
  AuthorCreateDto,
  AuthorCreateResultDto,
  AuthorUpdateDto,
  AuthorIdResultDto,
  AuthorDetailDto,
  AuthorList,
} from '../dtos/author-dto';

@injectable()
export class AuthorUseCases implements IAuthorUseCases {
  private readonly repository: AuthorRepository;
  private outputPort: IAuthorOutputPort;
  constructor(
    @inject(DI_TYPES.AuthorRepository) repository: AuthorRepository,
    @inject(DI_TYPES.AuthorOutputPort) outputPort: IAuthorOutputPort,
  ) {
    this.repository = repository;
    this.outputPort = outputPort;
  }

  async getAuthors(): Promise<AuthorList> {
    const res = await this.repository.getAuthors();
    return this.outputPort.toListAuthorResult(res);
  }

  async getAuthorById(id: AuthorIdDto): Promise<AuthorDetailDto> {
    const res = await this.repository.getAuthorById(id);
    return this.outputPort.toAuthorDetailResult(res);
  }

  async createAuthor(author: AuthorCreateDto): Promise<AuthorCreateResultDto> {
    const newAuthor = await this.repository.createAuthor(author);
    return this.outputPort.toCreateResult(newAuthor);
  }

  async updateAuthor(author: AuthorUpdateDto): Promise<AuthorIdResultDto> {
    const updatedAuthor = await this.repository.updateAuthor(author);
    return this.outputPort.toUpdateResult(updatedAuthor);
  }

  async deleteAuthor(id: string): Promise<AuthorIdResultDto> {
    await this.repository.deleteAuthor(id);
    return this.outputPort.toDeleteResult(id);
  }
}
