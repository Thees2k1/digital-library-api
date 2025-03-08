import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import { v7 as uuid } from 'uuid';
import { AuthorRepository } from '../../domain/repository/author-repository';
import {
  AuthorCreateDto,
  AuthorDetailDto,
  AuthorIdResultDto,
  AuthorList,
  AuthorUpdateDto,
  GetAuthorsOption,
  GetAuthorsResult,
} from '../dtos/author-dto';
import { AuthorMapper } from '../mapper/author-mapper';
import { IAuthorService } from './interfaces/author-service-interface';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import {
  DEFAULT_LIST_LIMIT,
  DEFAULT_LIST_OFFSET,
} from '@src/core/constants/constants';
import { SortOrder } from '@src/core/interfaces/base-repository';

@injectable()
export class AuthorService implements IAuthorService {
  private readonly repository: AuthorRepository;
  private readonly cacheService: CacheService;
  constructor(
    @inject(DI_TYPES.AuthorRepository) repository: AuthorRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
  ) {
    this.cacheService = cacheService;
    this.repository = repository;
  }

  async getList(params: GetAuthorsOption): Promise<GetAuthorsResult> {
    const cachekey = generateCacheKey('authors', params);

    const cacheData = await this.cacheService.get<GetAuthorsResult>(cachekey);
    if (cacheData) {
      return cacheData;
    }

    const page = params.page || 1;
    const limit = params.limit || DEFAULT_LIST_LIMIT;
    const res = await this.repository.getList({
      offset: (page - 1) * limit || DEFAULT_LIST_OFFSET,
      limit: limit || DEFAULT_LIST_LIMIT,
      sortBy: 'id',
      orderBy: SortOrder.ASC,
    });

    const data: AuthorList = res.map((author) => {
      return AuthorMapper.toAuthorDetailDto(author);
    });

    const returnData: GetAuthorsResult = {
      authors: data,
      limit,
      page,
    };

    await this.cacheService.set(cachekey, returnData);
    return returnData;
  }

  async getById(id: string): Promise<AuthorDetailDto | null> {
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
    id: string,
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
