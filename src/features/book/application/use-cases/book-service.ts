import { Id } from '@src/core/types';
import { BookRepository } from '../../domain/repository/book-repository';
import {
  BookCreateDto,
  BookDetailDto,
  BookListQueryDto,
  BookListResultDto,
  BookUpdateDto,
} from '../dtos/book-dto';
import { IBookService } from './interfaces/book-service-interface';
import { AppError } from '@src/core/errors/custom-error';
import { BookEntity } from '../../domain/entities/book-entity';
import { Author, DigitalItemData, Genre } from '../../domain/interfaces/models';
import { BookMapper } from '../mapper/book-mapper';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '@src/core/di/types';
import { config } from '@src/core/config/config';

@injectable()
export class BookService implements IBookService {
  private readonly repository: BookRepository;

  constructor(@inject(DI_TYPES.BookRepository) repository: BookRepository) {
    this.repository = repository;
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

      const bookData: Partial<BookEntity> = {
        title: data.title,
        cover: data.cover,
        description: data.description,
        author: bookAuthor,
        category: bookCategory,
        genres: bookGenres,
        digitalItems: digitalItems,
        releaseDate: releaseDate,
      };

      const book = await this.repository.create(bookData);
      await this.repository.updateBookGenres(data.genres, book.id);

      // await Promise.all(
      //   data.digitalItems.map(async (item) => {
      //     return await this.repository.addBookDigitalItem(item, book.id);
      //   }),
      // );

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
          id: book.category.id,
          name: book.category.name,
        },
        genres: book.genres.map((genre) => {
          return {
            id: genre.id,
            name: genre.name,
          };
        }),
        releaseDate: book.releaseDate?.toISOString(),
        updateAt: book.updatedAt.toISOString(),
      } as BookDetailDto;

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
        genres: bookGenres,
        releaseDate: releaseDate,
        digitalItems: digitalItems,
        updatedAt: new Date(),
      };

      await this.repository.update(id, bookData);
      return id;
    } catch (error) {
      throw error;
    }
  }
  async getList(query: BookListQueryDto): Promise<BookListResultDto> {
    try {
      const { page, limit, authorId, categoryId, publisherId, genres } = query;

      const paging = {
        page,
        limit,
      };

      const filter: any = {
        authorId,
        categoryId,
        publisherId,
        genres,
      };
      const [books, total] = await Promise.all([
        this.repository.getList(paging, filter),
        this.repository.count(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      const data = books.map((book) => BookMapper.toBookDetailDto(book));

      return {
        data,
        pagination: {
          ...paging,
          total,
          totalPages,
        },
      } as BookListResultDto;
    } catch (error) {
      throw error;
    }
  }
  async getById(id: string): Promise<BookDetailDto | null> {
    try {
      const res = await this.repository.getById(id);
      if (!res) {
        return null;
      }
      return BookMapper.toBookDetailDto(res);
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

      return id;
    } catch (error) {
      throw error;
    }
  }
}
