import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import { inject, injectable } from 'inversify';
import { v7 as uuid } from 'uuid';
import { AuthorRepository } from '../../domain/repository/author-repository';
import {
  AuthorCreateDto,
  AuthorDetailDto,
  AuthorIdResultDto,
  AuthorList,
  AuthorUpdateDto,
  GetAuthorsParams,
  GetAuthorsResult,
} from '../dtos/author-dto';
import { AuthorMapper } from '../mapper/author-mapper';
import { IAuthorService } from './interfaces/author-service-interface';

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

  async getList(params: GetAuthorsParams): Promise<GetAuthorsResult> {
    const cachekey = generateCacheKey('authors', params);

    const cacheData = await this.cacheService.get<GetAuthorsResult>(cachekey);
    if (cacheData) {
      console.log('Cache hit', cachekey);
      return cacheData;
    }

    const res = await this.repository.getList(params);
    const total = await this.repository.count({});

    const data: AuthorList = res.map((author) => {
      return AuthorMapper.toAuthorDetailDto(author);
    });

    const hasNextPage = res.length >= params.paging.limit;
    const nextCursor = hasNextPage ? res[res.length - 1].id : '';

    const returnData: GetAuthorsResult = {
      data,
      limit: params.paging.limit,
      hasNextPage,
      nextCursor,
      total,
    };

    await this.cacheService.set(cachekey, returnData, { EX: 60 });
    return returnData;
  }

  async getById(id: string): Promise<AuthorDetailDto | null> {
    const cacheKey = generateCacheKey('author', { id });
    const cacheData = await this.cacheService.get<AuthorDetailDto>(cacheKey);
    if (cacheData) {
      return cacheData;
    }

    const res = await this.repository.getById(id);
    if (!res) {
      return null;
    }

    const data = AuthorMapper.toAuthorDetailDto(res);
    await this.cacheService.set(cacheKey, data, { EX: 60 });
    return data;
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
