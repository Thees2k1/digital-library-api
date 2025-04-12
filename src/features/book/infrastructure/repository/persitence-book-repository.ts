import { Book, item_format, LikeStatus, PrismaClient } from '@prisma/client';
import { DEFAULT_LIST_LIMIT } from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { PagingOptions } from '@src/core/types';
import { inject, injectable } from 'inversify';
import {
  BooksFilter,
  BooksSortOptions,
  ReviewCreateDto,
  ReviewListResultDto,
  UpdateReadingDto,
} from '../../application/dtos/book-dto';
import { BookEntity } from '../../domain/entities/book-entity';
import { BookReading } from '../../domain/entities/book-reading';
import {
  Author,
  DigitalItemData,
  Genre,
  Review,
} from '../../domain/interfaces/models';
import {
  BookRepository,
  GetListResult,
} from '../../domain/repository/book-repository';

@injectable()
export class PersistenceBookRepository extends BookRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async getById(id: string): Promise<BookEntity | null> {
    const data = await this.prisma.book.findUnique({
      where: { id: id, status: { not: 'deleted' } },
      select: {
        id: true,
        title: true,
        description: true,
        cover: true,
        releaseDate: true,
        language: true,
        pages: true,
        updatedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        publisher: {
          select: {
            id: true,
            name: true,
          },
        },
        genres: {
          select: {
            genre: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
        digitalItems: {
          select: {
            format: true,
            url: true,
            size: true,
          },
        },
      },
    });

    if (!data) return null;
    const bookAuthor = {
      id: data.author.id,
      name: data.author.name,
      avatar: data.author.avatar ?? '',
      bio: data.author.bio ?? '',
    };
    const bookCategory = {
      id: data.category.id,
      name: data.category.name,
    };
    const bookGenres: Array<Genre> = data.genres.map((genre) => {
      return {
        id: genre.genre.id,
        name: genre.genre.name,
      } as Genre;
    });

    const bookReviews = data.reviews.map((review) => {
      return {
        id: review.id,
        rating: review.rating,
        comment: review.review ?? '',
      } as Review;
    });
    const bookPublisher = data.publisher
      ? { id: data.publisher.id, name: data.publisher.name }
      : undefined;

    const digitalItems = data.digitalItems.map((item) => {
      return {
        format: item.format,
        url: item.url,
        size: item.size,
      } as DigitalItemData;
    });
    return new BookEntity(
      data.id,
      data.title,
      data.cover,
      data.createdAt,
      bookAuthor,
      bookReviews,
      data.description ?? '',
      data.pages,
      data.language,
      data.releaseDate,
      data.updatedAt,
      bookCategory,
      bookPublisher,
      bookGenres,
      digitalItems,
    );
  }
  async getList(
    paging: PagingOptions | undefined,
    filter: BooksFilter | undefined,
    sort: BooksSortOptions | undefined,
  ): Promise<GetListResult> {
    const query = this._setupQuery(filter);
    const limit = paging?.limit ?? DEFAULT_LIST_LIMIT;
    const bookData = await this.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        cover: true,
        createdAt: true,
        description: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
      },
      where: { ...query },
      take: limit + 1,
      ...(paging?.cursor ? { skip: 1, cursor: { id: paging.cursor } } : {}),
      orderBy: sort?.field
        ? [{ [sort?.field]: sort.order }, { id: sort.order }]
        : { createdAt: 'asc' },
    });

    const hasNextPage = bookData.length > limit;
    if (hasNextPage) bookData.pop(); // Remove the extra record

    const nextCursor = hasNextPage ? bookData[bookData.length - 1].id : null;

    const books = bookData.map((book) => {
      const bookAuthor = {
        id: book.author.id,
        name: book.author.name,
      } as Author;

      const bookReviews: Array<Review> = book.reviews.map((review) => {
        return {
          id: review.id,
          rating: review.rating,
          comment: review.review ?? '',
        } as Review;
      });

      return new BookEntity(
        book.id,
        book.title,
        book.cover,
        book.createdAt,
        bookAuthor,
        bookReviews,
        book.description ?? '',
      );
    });

    return {
      books,
      nextCursor,
      hasNextPage,
    };
  }

  count(filter: BooksFilter | undefined): Promise<number> {
    const query: any = this._setupQuery(filter);
    return this.prisma.book.count({
      where: query,
    });
  }

  async create(data: Partial<BookEntity>): Promise<BookEntity> {
    if (data.author === undefined || data.category === undefined) {
      throw new Error('Author and Category are required');
    }
    const transactRes = await this.prisma.$transaction(async (prisma) => {
      const mappedBookData = {
        title: data.title!,
        cover: data.cover!,
        authorId: data.author!.id,
        categoryId: data.category!.id,
        language: '',
        description: data.description,
        releaseDate: data.releaseDate ?? new Date(),
        pages: data.pages ?? 0,
        publisherId: data.publisher?.id ? data.publisher.id : undefined,
      };
      const book = await prisma.book.create({
        data: mappedBookData,
      });
      if (data.genres) {
        await prisma.bookGenre.createMany({
          data: data.genres.map((genre) => {
            return {
              bookId: book.id,
              genreId: genre.id,
            };
          }),
        });
      }
      if (data.digitalItems) {
        await prisma.bookDigitalItem.createMany({
          data: data.digitalItems.map((item) => {
            return {
              bookId: book.id,
              format: item.format as item_format,
              url: item.url,
              size: item.size,
              md5: '',
              sha256: '',
            };
          }),
        });
      }

      return new BookEntity(
        book.id,
        book.title,
        book.cover,
        book.createdAt,
        data.author!,
      );
    });

    return transactRes;
  }

  async update(id: string, data: Partial<BookEntity>): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const bookIdBin = id;
      const authorIdBin = data.author ? data.author.id : undefined;
      const categoryIdBin = data.category ? data.category.id : undefined;
      const publisherIdBin = data.publisher ? data.publisher.id : undefined;
      const mappedData = {
        title: data.title,
        cover: data.cover,
        description: data.description,
        releaseDate: data.releaseDate,
        publisherId: publisherIdBin,
        categoryId: categoryIdBin,
        authorId: authorIdBin,
        pages: data.pages,
        updatedAt: data.updatedAt ?? new Date(),
      };

      await prisma.book.update({
        where: { id: bookIdBin },
        data: mappedData,
      });

      if (data.genres) {
        await prisma.bookGenre.deleteMany({
          where: { bookId: bookIdBin },
        });
        await prisma.bookGenre.createMany({
          data: data.genres.map((genre) => {
            return {
              bookId: bookIdBin,
              genreId: genre.id,
            };
          }),
        });
      }
      if (data.digitalItems) {
        for (const item of data.digitalItems) {
          await prisma.bookDigitalItem.upsert({
            where: {
              bookId_format: {
                bookId: bookIdBin,
                format: item.format as item_format,
              },
            },
            update: {
              url: item.url,
              size: item.size,
            },
            create: {
              bookId: bookIdBin,
              format: item.format as item_format,
              url: item.url,
              size: item.size,
              md5: '',
              sha256: '',
            },
          });
        }
      }
    });
  }

  async delete(id: string, performHardDelete: boolean = false): Promise<void> {
    if (performHardDelete) {
      await this.prisma.bookGenre.deleteMany({
        where: { bookId: id },
      });

      await this.prisma.bookDigitalItem.deleteMany({
        where: { bookId: id },
      });

      await this.prisma.book.delete({
        where: { id: id },
      });

      return;
    }

    await this.prisma.book.update({
      where: { id: id },
      data: {
        status: 'deleted',
      },
    });
  }

  async getByTitleAsync(title: string): Promise<BookEntity | null> {
    const data: Book | null = await this.prisma.book.findFirst({
      where: { title: title, status: { not: 'deleted' } },
    });
    if (!data) return null;

    return new BookEntity(data.id, data.title, data.cover, data.createdAt, {
      id: '',
      name: '',
      avatar: '',
      bio: '',
    });
  }

  async updateBookGenres(genres: string[], bookId: string): Promise<void> {
    await this.prisma.bookGenre.deleteMany({
      where: { bookId: bookId },
    });
    await this.prisma.bookGenre.createMany({
      data: genres.map((genre) => {
        return {
          bookId: bookId,
          genreId: genre,
        };
      }),
    });
  }

  async addBookDigitalItem(
    itemData: DigitalItemData,
    bookId: string,
  ): Promise<{ id: string }> {
    const inputDataMapped = {
      bookId: bookId,
      format: itemData.format as item_format,
      url: itemData.url,
      size: itemData.size,
      md5: '',
      sha256: '',
    };
    const res = await this.prisma.bookDigitalItem.create({
      data: inputDataMapped,
    });

    return { id: res.id };
  }

  async addReview(data: ReviewCreateDto): Promise<void> {
    await this.prisma.review.create({
      data: {
        bookId: data.bookId,
        userId: data.userId,
        rating: data.rating,
        review: data.comment ?? '',
      },
    });
  }

  async getReviews(
    bookId: string,
    page: number,
    limit: number,
  ): Promise<ReviewListResultDto> {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { bookId: bookId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { bookId: bookId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const data = reviews.map((review) => ({
      id: review.id,
      bookId: review.bookId,
      reviewer: {
        id: review.user.id,
        username: `${review.user.firstName} ${review.user.lastName}`,
        avatar: review.user.avatar ?? '',
      },
      rating: review.rating,
      comment: review.review,
      createdAt: review.createdAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async setLikeStatus(
    userId: string,
    bookId: string,
    status: LikeStatus,
  ): Promise<void> {
    await this.prisma.like.upsert({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
      create: {
        userId: userId,
        bookId: bookId,
        status,
      },
      update: {
        status,
      },
    });
  }

  async getLikeStatus(
    userId: string,
    bookId: string,
  ): Promise<LikeStatus | null> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
      select: {
        status: true,
      },
    });
    return like ? like.status : null;
  }

  async getLikeCount(bookId: string): Promise<number> {
    const count = await this.prisma.like.count({
      where: {
        bookId: bookId,
        status: 'liked',
      },
    });
    return count;
  }

  async getAllBooks(): Promise<BookEntity[]> {
    const books = await this.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        cover: true,
        releaseDate: true,
        language: true,
        pages: true,
        updatedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        publisher: {
          select: {
            id: true,
            name: true,
          },
        },
        genres: {
          select: {
            genre: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
        digitalItems: {
          select: {
            format: true,
            url: true,
            size: true,
          },
        },
      },
      where: {
        status: {
          not: 'deleted',
        },
      },
    });

    return books.map((book) => {
      const bookAuthor = {
        id: book.author.id,
        name: book.author.name,
        avatar: book.author.avatar ?? '',
        bio: book.author.bio ?? '',
      };
      const bookCategory = {
        id: book.category.id,
        name: book.category.name,
      };
      const bookGenres: Array<Genre> = book.genres.map((genre) => {
        return {
          id: genre.genre.id,
          name: genre.genre.name,
        } as Genre;
      });

      const bookReviews = book.reviews.map((review) => {
        return {
          id: review.id,
          rating: review.rating,
          comment: review.review ?? '',
        } as Review;
      });
      const bookPublisher = book.publisher
        ? { id: book.publisher.id, name: book.publisher.name }
        : undefined;

      const digitalItems = book.digitalItems.map((item) => {
        return {
          format: item.format,
          url: item.url,
          size: item.size,
        } as DigitalItemData;
      });
      return new BookEntity(
        book.id,
        book.title,
        book.cover,
        book.createdAt,
        bookAuthor,
        bookReviews,
        book.description ?? '',
        book.pages,
        book.language,
        book.releaseDate,
        book.updatedAt,
        bookCategory,
        bookPublisher,
        bookGenres,
        digitalItems,
      );
    });
  }

  async getUserLikeList(userId: string): Promise<Array<string>> {
    const dbData = await this.prisma.like.findMany({
      where: { userId: userId, status: 'liked' },
    });

    return dbData.map((like) => like.bookId);
  }

  async getReadingList(userId: string): Promise<Array<BookReading>> {
    const dbData = await this.prisma.userReadBook.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        book: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        currentPage: true,
        latestProcess: true,
        isFinished: true,
        updatedAt: true,
      },
    });

    const readingList: Array<BookReading> = dbData.map((data) => {
      return new BookReading(
        data.id,
        data.book.id,
        data.userId,
        data.currentPage ?? 0,
        data.latestProcess ?? 0,
        data.isFinished,
        data.updatedAt,
        data.book.title,
        data.book.cover,
        { id: data.book.author.id, name: data.book.author.name },
      );
    });

    return readingList;
  }
  async getReading(
    userId: string,
    bookId: string,
  ): Promise<BookReading | null> {
    const dbData = await this.prisma.userReadBook.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
      },
      select: {
        id: true,
        userId: true,
        currentPage: true,
        latestProcess: true,
        updatedAt: true,
        isFinished: true,
        book: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!dbData) {
      return null;
    }

    return new BookReading(
      dbData.id,
      dbData.book.id,
      dbData.userId,
      dbData.currentPage ?? 0,
      dbData.latestProcess ?? 0,
      dbData.isFinished,
      dbData.updatedAt,
      dbData.book.title,
      dbData.book.cover,
      { id: dbData.book.author.id, name: dbData.book.author.name },
    );
  }

  async createReading(
    userId: string,
    bookId: string,
    data: BookReading,
  ): Promise<void> {
    await this.prisma.userReadBook.create({
      data: {
        userId: userId,
        bookId: bookId,
        currentPage: data.currentPage,
        latestProcess: data.progress,
        isFinished: data.isFinished,
        updatedAt: data.lastRead,
      },
    });
  }
  async updateReading(
    userId: string,
    bookId: string,
    data: UpdateReadingDto,
  ): Promise<void> {
    await this.prisma.userReadBook.upsert({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId,
        },
      },
      create: {
        userId: userId,
        bookId: bookId,
        currentPage: data.currentPage,
        latestProcess: data.progress,
        isFinished: data.isFinished,
        updatedAt: data.lastReadAt,
      },
      update: {
        currentPage: data.currentPage,
        latestProcess: data.progress,
        isFinished: data.isFinished,
        updatedAt: data.lastReadAt,
      },
    });
  }

  async getFavoriteBooks(userId: string): Promise<Array<BookEntity>> {
    const dbData = await this.prisma.book.findMany({
      where: {
        status: {
          not: 'deleted',
        },
        favoriteBooks: {
          some: {
            userId: userId,
            isFavorite: true,
          },
        },
      },
      select: {
        id: true,
        title: true,
        cover: true,
        createdAt: true,
        description: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
      },
    });

    return dbData.map((book) => {
      const bookAuthor = {
        id: book.author.id,
        name: book.author.name,
      } as Author;

      const bookReviews: Array<Review> = book.reviews.map((review) => {
        return {
          id: review.id,
          rating: review.rating,
          comment: review.review ?? '',
        } as Review;
      });

      return new BookEntity(
        book.id,
        book.title,
        book.cover,
        book.createdAt,
        bookAuthor,
        bookReviews,
        book.description ?? '',
      );
    });
  }
  async updateFavorite(
    userId: string,
    bookId: string,
    isFavorite: boolean,
  ): Promise<void> {
    await this.prisma.userFavoriteBook.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      create: {
        userId,
        bookId,
        isFavorite,
      },
      update: {
        isFavorite,
      },
    });
  }

  async getPopularBooks(limit: number): Promise<BookEntity[]> {
    const books = await this.prisma.book.findMany({
      take: limit,
      where: {
        status: {
          not: 'deleted',
        },
        readBooks: {
          some: {
            OR: [{ isFinished: true }, { latestProcess: { gt: 0 } }],
          },
        },
      },
      orderBy: [
        {
          readBooks: {
            _count: 'desc',
          },
        },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        cover: true,
        releaseDate: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
        readBooks: {
          where: {
            OR: [{ isFinished: true }, { latestProcess: { gt: 0 } }],
          },
          select: {
            isFinished: true,
            latestProcess: true,
          },
        },
        _count: {
          select: {
            readBooks: {
              where: {
                OR: [{ isFinished: true }, { latestProcess: { gt: 0 } }],
              },
            },
          },
        },
      },
    });

    const sortedBooks = [...books].sort((a, b) => {
      const aFavorites = a.readBooks.filter((rb) => rb.isFinished).length;
      const bFavorites = b.readBooks.filter((rb) => rb.isFinished).length;

      if (aFavorites !== bFavorites) {
        return bFavorites - aFavorites;
      }

      const aReads = a.readBooks.filter(
        (rb) => rb.latestProcess && rb.latestProcess > 0,
      ).length;
      const bReads = b.readBooks.filter(
        (rb) => rb.latestProcess && rb.latestProcess > 0,
      ).length;
      return bReads - aReads;
    });

    return sortedBooks.map((book) => {
      const bookReviews: Review[] = book.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.review ?? '',
      }));

      const favoriteCount = book.readBooks.filter((rb) => rb.isFinished).length;
      const readCount = book.readBooks.filter(
        (rb) => rb.latestProcess && rb.latestProcess > 0,
      ).length;

      return new BookEntity(
        book.id,
        book.title,
        book.cover,
        book.createdAt,
        {
          id: book.author.id,
          name: book.author.name,
          avatar: book.author.avatar ?? '',
        },
        bookReviews,
        book.description ?? '',
        undefined,
        undefined,
        book.releaseDate,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        favoriteCount,
        readCount,
      );
    });
  }

  async getAll(): Promise<BookEntity[]> {
    const books = await this.prisma.book.findMany({
      where: { status: { not: 'deleted' } },
      select: {
        id: true,
        title: true,
        cover: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return books.map((book) => {
      const bookAuthor = { id: book.author.id, name: book.author.name };
      const bookCategory = { id: book.category.id, name: book.category.name };
      return new BookEntity(
        book.id,
        book.title,
        book.cover,
        book.createdAt,
        bookAuthor,
        [],
        '',
        undefined,
        undefined,
        undefined,
        book.updatedAt,
        bookCategory,
      );
    });
  }

  async updatePopularityScore(bookId: string, score: number): Promise<void> {
    await this.prisma.book.update({
      where: { id: bookId },
      data: { popularityPoints: score },
    });
  }

  private _setupQuery(filter: BooksFilter | undefined): any {
    const query: any = {
      status: {
        not: 'deleted',
      },
    };

    if (filter) {
      if (filter.query) {
        query.title = {
          contains: filter.query,
          mode: 'insensitive',
        };
      }
      if (filter.authorId) {
        query.authorId = filter.authorId;
      }
      if (filter.categoryId) {
        query.categoryId = filter.categoryId;
      }
      if (filter.publisherId) {
        query.publisherId = filter.publisherId;
      }
      if (filter.genres) {
        query.genres = {
          some: {
            genreId: {
              in: [...filter.genres.map((id) => id)],
            },
          },
        };
      }
      if (filter.releaseDateRange) {
        query.releaseDate = {
          gte: new Date(filter.releaseDateRange.from ?? 1950, 0, 1),
          lte: new Date(filter.releaseDateRange.to ?? 2050, 11, 31),
        };
      }
    }

    return query;
  }
}
