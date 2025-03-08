import { config } from '@src/core/config/config';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { SearchService } from '@src/core/interfaces/search-service';
import { GetListOptions, Id } from '@src/core/types';
import { inject, injectable } from 'inversify';
import { BookEntity } from '../../domain/entities/book-entity';
import {
  Author,
  DigitalItemData,
  Genre,
  LikeStatus,
} from '../../domain/interfaces/models';
import { BookRepository } from '../../domain/repository/book-repository';
import {
  BookCreateDto,
  BookDetailDto,
  BookIndexRecord,
  bookListSchema,
  BooksFilter,
  BookUpdateDto,
  GetListResult,
  ReviewCreateDto,
  ReviewListResultDto,
} from '../dtos/book-dto';
import { BookMapper } from '../mapper/book-mapper';
import { IBookService } from './interfaces/book-service-interface';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import { eventEmitter, EVENTS } from '@src/core/events';

@injectable()
export class BookService implements IBookService {
  private readonly repository: BookRepository;
  private readonly searchService: SearchService;
  private readonly cacheService: CacheService;

  constructor(
    @inject(DI_TYPES.BookRepository) repository: BookRepository,
    @inject(DI_TYPES.SearchService) searchService: SearchService,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
  ) {
    this.repository = repository;
    this.searchService = searchService;
    this.cacheService = cacheService;
  }
  async create(data: BookCreateDto): Promise<BookDetailDto> {
    try {
      const bookExisted = await this.repository.getByTitleAsync(data.title);
      if (bookExisted) {
        throw AppError.forbidden('Book existed, update instead of create.');
      }

      const bookAuthor: Author = {
        id: data.authorId,
        name: '',
        avatar: '',
        bio: '',
      };

      const bookCategory = {
        id: data.categoryId,
        name: '',
      };

      const bookGenres = data.genres.map((genreId) => {
        return {
          id: genreId,
          name: '',
        } as Genre;
      });

      const digitalItems = data.digitalItems.map((item) => {
        return {
          bookId: '',
          url: item.url,
          format: item.format,
          size: item.size,
        } as DigitalItemData;
      });

      const releaseDate = data.releaseDate
        ? new Date(data.releaseDate)
        : undefined;

      const publisher = data.publisherId
        ? {
            id: data.publisherId,
            name: '',
          }
        : undefined;

      const bookData: Partial<BookEntity> = {
        title: data.title,
        cover: data.cover,
        description: data.description,
        publisher: publisher,
        author: bookAuthor,
        category: bookCategory,
        genres: bookGenres,
        digitalItems: digitalItems,
        releaseDate: releaseDate,
      };

      const book = await this.repository.create(bookData);
      await this.repository.updateBookGenres(data.genres, book.id);

      const returnData = {
        id: book.id,
        title: book.title,
        cover: book.cover,
        description: book.description,
        author: {
          id: book.author.id,
          name: book.author.name,
        },
        category: {
          id: book.category?.id || '',
          name: book.category?.name || '',
        },
        genres: book.genres
          ? book.genres?.map((genre) => {
              return {
                id: genre.id,
                name: genre.name,
              };
            })
          : [],
        releaseDate: book.releaseDate?.toISOString(),
        updateAt: book.updatedAt?.toISOString() || '',
      } as BookDetailDto;

      eventEmitter.emit(EVENTS.NEED_INDEXING, book);

      return returnData;
    } catch (error) {
      throw error;
    }
  }
  async update(id: Id, data: BookUpdateDto): Promise<string> {
    try {
      const bookExisted = await this.repository.getById(id);
      if (!bookExisted) {
        throw AppError.notFound('Book not found.');
      }

      const bookAuthor: Author | undefined = data.authorId
        ? {
            id: data.authorId,
            name: '',
            avatar: '',
            bio: '',
          }
        : undefined;

      const bookPublisher = data.publisherId
        ? {
            id: data.publisherId,
            name: '',
          }
        : undefined;

      const bookCategory = data.categoryId
        ? {
            id: data.categoryId,
            name: '',
          }
        : undefined;

      const bookGenres = data.genres
        ? data.genres.map((genreId) => {
            return {
              id: genreId,
              name: '',
            } as Genre;
          })
        : undefined;

      const releaseDate = data.releaseDate
        ? new Date(data.releaseDate)
        : undefined;

      const digitalItems = data.digitalItems?.map((item) => {
        return {
          bookId: '',
          url: item.url,
          format: item.format,
          size: item.size,
        } as DigitalItemData;
      });

      const bookData: Partial<BookEntity> = {
        title: data.title,
        cover: data.cover,
        description: data.description,
        author: bookAuthor,
        category: bookCategory,
        publisher: bookPublisher,
        genres: bookGenres,
        releaseDate: releaseDate,
        digitalItems: digitalItems,
        updatedAt: new Date(),
      };

      await this.repository.update(id, bookData);

      const updated = await this.repository.getById(id);

      if (updated) {
        eventEmitter.emit(EVENTS.NEED_INDEXING, updated);
      }
      return id;
    } catch (error) {
      throw error;
    }
  }
  async getList(options: GetListOptions<BooksFilter>): Promise<GetListResult> {
    const cacheKey = generateCacheKey('books:list', options);
    try {
      const { paging, filter, sort } = options;

      const cachedData = await this.cacheService.get<GetListResult>(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const [books, total] = await Promise.all([
        this.repository.getList(paging, filter, sort),
        this.repository.count(filter),
      ]);

      const data = BookMapper.toBooks(books);

      const hasNextPage = books.length === (paging?.limit ?? 20);
      const nextCursor = hasNextPage ? books[books.length - 1].id : null;

      const bookList = bookListSchema.safeParse(data);

      if (bookList.error) {
        console.error('invaid return data', bookList.error);
        throw AppError.internalServer('Something went wrong.');
      }

      const returnData: GetListResult = {
        data: bookList.data,
        nextCursor: nextCursor || '',
        total,
        hasNextPage,
      };

      // Cache the data for future requests
      await this.cacheService.set(cacheKey, returnData, { EX: 60 }); // Cache for 60 seconds
      return returnData;
    } catch (error) {
      throw error;
    }
  }

  async search(query: string, page: number, limit: number): Promise<any> {
    try {
      if (query === '') {
        console.log('empty query');
        return { hits: [], total: 0, offset: 0, limit: 0, query: '' };
      }
      const result = await this.searchService.search<BookIndexRecord>(query, {
        indexName: 'books',
        params: {
          page,
          limit,
        },
      });

      return result;
    } catch (error: any) {
      throw error;
    }
  }

  async getById(id: string): Promise<BookDetailDto | null> {
    const cacheKey = `books:detail:${id}`;
    try {
      const cachedData = await this.cacheService.get<BookDetailDto>(cacheKey);

      if (cachedData) {
        console.log('Cache hit');
        return cachedData;
      }

      console.log('Cache miss. Fetching from database...');
      const res = await this.repository.getById(id);
      if (!res) {
        throw AppError.notFound('Book not found.');
      }
      const bookDetail = BookMapper.toBookDetailDto(res);

      // Cache the data for future requests
      await this.cacheService.set(cacheKey, bookDetail, { EX: 60 }); // Cache for 60 seconds

      return bookDetail;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<string> {
    const isHardDelete = config.nodeEnv === 'development';
    try {
      if (isHardDelete) {
        await this.repository.delete(id, isHardDelete);
        return id;
      }

      const bookExisted = await this.repository.getById(id);
      if (!bookExisted) {
        throw AppError.notFound('Book not found.');
      }

      await this.repository.delete(id, isHardDelete);

      eventEmitter.emit(EVENTS.NEED_INDEXING, { id, action: 'delete' });

      return id;
    } catch (error) {
      throw error;
    }
  }

  async addReview(review: ReviewCreateDto): Promise<string> {
    try {
      await this.repository.addReview(review);

      return 'Review added';
    } catch (error) {
      throw error;
    }
  }
  async getReviews(
    bookId: string,
    page: number,
    limit: number,
  ): Promise<ReviewListResultDto> {
    try {
      return await this.repository.getReviews(bookId, page, limit);
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(userId: string, bookId: string): Promise<void> {
    const currentStatus = await this.repository.getLikeStatus(userId, bookId);
    const newStatus =
      currentStatus === 'liked' ? LikeStatus.UNLIKED : LikeStatus.LIKED;
    await this.repository.setLikeStatus(userId, bookId, newStatus);
  }

  async getLikeCount(bookId: string): Promise<number> {
    return await this.repository.getLikeCount(bookId);
  }

  async indexAllBooks(documents: BookDetailDto[]): Promise<void> {
    const indexDatas: Array<BookIndexRecord> = documents.map((item) => {
      return {
        id: item.id,
        title: item.title,
        cover: item.cover,
        description: item.description,
        authorName: item.author.name,
        categoryName: item.category.name,
        rating: item.averageRating || 0,
        genres: item.genres.map((genre) => genre.name),
        releaseDate: item.releaseDate,
      } satisfies BookIndexRecord;
    });

    await this.searchService.index({
      indexName: 'books',
      documents: indexDatas,
    });

    console.log('updated all books');
  }
}
