import { Book, item_format, LikeStatus, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { binaryToUuid, uuidToBinary } from '@src/core/utils/utils';
import { inject, injectable } from 'inversify';
import { BookEntity } from '../../domain/entities/book-entity';
import { Filter, Paging } from '../../domain/interfaces/common';
import {
  Author,
  Category,
  DigitalItemData,
  Genre,
  Review,
} from '../../domain/interfaces/models';
import { BookRepository } from '../../domain/repository/book-repository';
import {
  ReviewCreateDto,
  ReviewDetailDto,
  ReviewListResultDto,
} from '../../application/dtos/book-dto';

@injectable()
export class PersistenceBookRepository extends BookRepository {
  private readonly prisma: PrismaClient;
  constructor(@inject(DI_TYPES.PrismaClient) prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async getById(id: string): Promise<BookEntity | null> {
    const data = await this.prisma.book.findUnique({
      where: { id: uuidToBinary(id), status: { not: 'deleted' } },
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
      id: binaryToUuid(data.author.id),
      name: data.author.name,
      avatar: data.author.avatar ?? '',
      bio: data.author.bio ?? '',
    };
    const bookCategory = {
      id: binaryToUuid(data.category.id),
      name: data.category.name,
    };
    const bookGenres: Array<Genre> = data.genres.map((genre) => {
      return {
        id: binaryToUuid(genre.genre.id),
        name: genre.genre.name,
      } as Genre;
    });

    const bookReviews = data.reviews.map((review) => {
      return {
        id: binaryToUuid(review.id),
        rating: review.rating,
        comment: review.review ?? '',
      } as Review;
    });
    const bookPublisher = data.publisher
      ? { id: binaryToUuid(data.publisher.id), name: data.publisher.name }
      : undefined;

    const digitalItems = data.digitalItems.map((item) => {
      return {
        format: item.format,
        url: item.url,
        size: item.size,
      } as DigitalItemData;
    });
    return new BookEntity(
      binaryToUuid(data.id),
      data.title,
      data.cover,
      data.description ?? '',
      data.pages,
      data.language,
      data.releaseDate,
      data.createdAt,
      data.updatedAt,
      bookAuthor,
      bookCategory,
      bookPublisher,
      bookGenres,
      bookReviews,
      digitalItems,
    );
  }
  async getList(
    paging: Paging | undefined,
    filter: Filter | undefined,
  ): Promise<BookEntity[]> {
    const pagingData = paging ?? { page: 1, limit: 10 };
    const skip = (pagingData.page - 1) * pagingData.limit;
    const take = pagingData.limit;

    const query: any = {
      status: {
        not: 'deleted',
      },
    };

    if (filter) {
      if (filter.authorId) {
        query.authorId = uuidToBinary(filter.authorId);
      }
      if (filter.categoryId) {
        query.categoryId = uuidToBinary(filter.categoryId);
      }
      if (filter.publisherId) {
        query.publisherId = uuidToBinary(filter.publisherId);
      }
      if (filter.genres) {
        query.genres = {
          some: {
            genreId: {
              in: filter.genres.map((genre) => uuidToBinary(genre)),
            },
          },
        };
      }
    }
    const bookData = await this.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        cover: true,
        pages: true,
        language: true,
        releaseDate: true,
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
            cover: true,
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
        digitalItems: {
          select: {
            format: true,
            url: true,
            size: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            review: true,
          },
        },
        likes: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      where: query,
      skip,
      take,
    });

    return bookData.map((book) => {
      const bookAuthor = {
        id: binaryToUuid(book.author.id),
        name: book.author.name,
        avatar: book.author.avatar ?? '',
        bio: book.author.bio ?? '',
      } as Author;
      const bookCategory = {
        id: binaryToUuid(book.category.id),
        name: book.category.name,
        cover: book.category.cover ?? '',
      } as Category;

      const bookPublisher = book.publisher
        ? { id: binaryToUuid(book.publisher.id), name: book.publisher.name }
        : undefined;
      const bookGenres: Array<Genre> = book.genres.map((genre) => {
        return {
          id: binaryToUuid(genre.genre.id),
          name: genre.genre.name,
        } as Genre;
      });

      const bookReviews: Array<Review> = book.reviews.map((review) => {
        return {
          id: binaryToUuid(review.id),
          rating: review.rating,
          comment: review.review ?? '',
        } as Review;
      });

      const digitalItems = book.digitalItems.map((item) => {
        return {
          format: item.format,
          url: item.url,
          size: item.size,
        } as DigitalItemData;
      });
      return new BookEntity(
        binaryToUuid(book.id),
        book.title,
        book.cover,
        book.description ?? '',
        book.pages,
        book.language,
        book.releaseDate,
        book.createdAt,
        book.updatedAt,
        bookAuthor,
        bookCategory,
        bookPublisher,
        bookGenres,
        bookReviews,
        digitalItems,
      );
    });
  }
  count(filter: Filter | undefined): Promise<number> {
    const query: any = {
      status: {
        not: 'deleted',
      },
    };
    if (filter) {
      if (filter.authorId) {
        query.authorId = uuidToBinary(filter.authorId);
      }
      if (filter.categoryId) {
        query.categoryId = uuidToBinary(filter.categoryId);
      }
      if (filter.publisherId) {
        query.publisherId = uuidToBinary(filter.publisherId);
      }
      if (filter.genres) {
        query.genres = {
          some: {
            genreId: {
              in: filter.genres.map((genre) => uuidToBinary(genre)),
            },
          },
        };
      }
    }

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
        authorId: uuidToBinary(data.author!.id),
        categoryId: uuidToBinary(data.category!.id),
        language: '',
        description: data.description,
        releaseDate: data.releaseDate ?? new Date(),
        pages: data.pages ?? 0,
        publisherId: data.publisher?.id
          ? uuidToBinary(data.publisher.id)
          : undefined,
      };

      const book = await prisma.book.create({
        data: mappedBookData,
      });

      if (data.genres) {
        await prisma.bookGenre.createMany({
          data: data.genres.map((genre) => {
            return {
              bookId: book.id,
              genreId: uuidToBinary(genre.id),
            };
          }),
        });
      }
      console.log(data.digitalItems);
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
        binaryToUuid(book.id),
        book.title,
        book.cover,
        book.description ?? '',
        book.pages,
        book.language,
        book.releaseDate,
        book.createdAt,
        book.updatedAt,
        data.author!,
        data.category!,
        { id: '', name: '' },
        [],
        [],
        [],
      );
    });

    return transactRes;
  }

  async update(id: string, data: Partial<BookEntity>): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const bookIdBin = uuidToBinary(id);
      const mappedData = {
        title: data.title,
        cover: data.cover,
        description: data.description,
        releaseDate: data.releaseDate,
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
              genreId: uuidToBinary(genre.id),
            };
          }),
        });
      }

      console.log(data.digitalItems);
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
        where: { bookId: uuidToBinary(id) },
      });

      await this.prisma.bookDigitalItem.deleteMany({
        where: { bookId: uuidToBinary(id) },
      });

      await this.prisma.book.delete({
        where: { id: uuidToBinary(id) },
      });

      return;
    }

    await this.prisma.book.update({
      where: { id: uuidToBinary(id) },
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

    return new BookEntity(
      binaryToUuid(data.id),
      data.title,
      data.cover,
      data.description ?? '',
      data.pages,
      data.language,
      data.releaseDate,
      data.createdAt,
      data.updatedAt,
      { id: '', name: '', avatar: '', bio: '' },
      { id: '', name: '' },
      { id: '', name: '' },
      [],
      [],
      [],
    );
  }

  async updateBookGenres(genres: string[], bookId: string): Promise<void> {
    const bookIdBin = uuidToBinary(bookId);
    await this.prisma.bookGenre.deleteMany({
      where: { bookId: bookIdBin },
    });
    await this.prisma.bookGenre.createMany({
      data: genres.map((genre) => {
        return {
          bookId: bookIdBin,
          genreId: uuidToBinary(genre),
        };
      }),
    });
  }
  async addBookDigitalItem(
    itemData: DigitalItemData,
    bookId: string,
  ): Promise<{ id: string }> {
    const inputDataMapped = {
      bookId: uuidToBinary(bookId),
      format: itemData.format as item_format,
      url: itemData.url,
      size: itemData.size,
      md5: '',
      sha256: '',
    };
    const res = await this.prisma.bookDigitalItem.create({
      data: inputDataMapped,
    });

    return { id: binaryToUuid(res.id) };
  }
  getBookAuthor(bookId: string): Promise<object> {
    throw new Error('Method not implemented.');
  }
  getBookCategory(bookId: string): Promise<object> {
    throw new Error('Method not implemented.');
  }
  getBookGenres(bookId: string): Promise<object[]> {
    throw new Error('Method not implemented.');
  }

  async addReview(data: ReviewCreateDto): Promise<void> {
    await this.prisma.review.create({
      data: {
        bookId: uuidToBinary(data.bookId),
        userId: uuidToBinary(data.userId),
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
        where: { bookId: uuidToBinary(bookId) },
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
        where: { bookId: uuidToBinary(bookId) },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const data = reviews.map((review) => ({
      id: binaryToUuid(review.id),
      bookId: binaryToUuid(review.bookId),
      reviewer: {
        id: binaryToUuid(review.user.id),
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
          userId: uuidToBinary(userId),
          bookId: uuidToBinary(bookId),
        },
      },
      create: {
        userId: uuidToBinary(userId),
        bookId: uuidToBinary(bookId),
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
          userId: uuidToBinary(userId),
          bookId: uuidToBinary(bookId),
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
        bookId: uuidToBinary(bookId),
        status: 'liked',
      },
    });
    return count;
  }
  getBookDigitalItems(bookId: string): Promise<object[]> {
    throw new Error('Method not implemented.');
  }
  getBookReviews(bookId: string): Promise<object[]> {
    throw new Error('Method not implemented.');
  }
  getReviewsCount(bookId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getAverageRating(bookId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
