import {
  BookDetailDto,
  BookIndexRecord,
  BookList,
} from '../../application/dtos/book-dto';
import {
  Author,
  Category,
  DigitalItemData,
  Genre,
  Publisher,
  Review,
} from '../interfaces/models';

export class BookEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly cover: string,
    public readonly createdAt: Date,
    public readonly author: Author,
    public readonly reviews?: Review[],
    public readonly description?: string,
    public readonly pages?: number,
    public readonly language?: string,
    public readonly releaseDate?: Date,
    public readonly updatedAt?: Date,
    public readonly category?: Category,
    public readonly publisher?: Publisher,
    public readonly genres?: Genre[],
    public readonly digitalItems?: DigitalItemData[],
    public readonly likes?: number,
  ) {}

  copyWith(updates: Partial<BookEntity>): BookEntity {
    return new BookEntity(
      updates.id ?? this.id,
      updates.title ?? this.title,
      updates.cover ?? this.cover,
      updates.createdAt ?? this.createdAt,
      updates.author ?? this.author,
      updates.reviews ?? this.reviews,
      updates.description ?? this.description,
      updates.pages ?? this.pages,
      updates.language ?? this.language,
      updates.releaseDate ?? this.releaseDate,
      updates.updatedAt ?? this.updatedAt,
      updates.category ?? this.category,
      updates.publisher ?? this.publisher,
      updates.genres ?? this.genres,
      updates.digitalItems ?? this.digitalItems,
      updates.likes ?? this.likes,
    );
  }

  get averageRating(): number {
    if (!this.reviews || this.reviews.length === 0) {
      return 0;
    }

    const totalRating = this.reviews.reduce((acc, review) => {
      return acc + review.rating;
    }, 0);

    return totalRating / this.reviews.length;
  }

  static toBookDetailDto(book: BookEntity) {
    return {
      id: book.id,
      title: book.title,
      cover: book.cover,
      pages: book.pages,
      language: book.language,
      description: book.description,
      averageRating: book.averageRating,
      author: {
        id: book.author.id,
        avatar: book.author.avatar,
        name: book.author.name,
        bio: book.author.bio,
      },
      publisher: {
        id: book.publisher ? book.publisher.id : null,
        name: book.publisher ? book.publisher.name : null,
      },
      category: {
        id: book.category?.id,
        name: book.category?.name,
      },
      genres: book.genres?.map((genre) => {
        return {
          id: genre.id,
          name: genre.name,
        };
      }),
      digitalItems: book.digitalItems?.map((item) => {
        return {
          format: item.format,
          url: item.url,
        };
      }),
      releaseDate: book.releaseDate?.toISOString(),
      updateAt: book.updatedAt?.toISOString(),
    } as BookDetailDto;
  }

  static toBooks(books: BookEntity[]): BookList {
    return books.map((book) => {
      return {
        id: book.id,
        title: book.title,
        cover: book.cover,
        author: book.author,
        description: book.description ?? '',
        createdAt: book.createdAt.toDateString(),
        averageRating: book.averageRating,
      };
    });
  }

  static toBookIndexRecord(book: BookEntity): BookIndexRecord {
    return {
      id: book.id,
      title: book.title,
      releaseDate: book.releaseDate?.toISOString(),
      authorName: book.author.name,
      categoryName: book.category?.name,
      rating: book.averageRating,
      genres: book.genres?.map((genre) => genre.name) || [],
    } as BookIndexRecord;
  }

  static toBookIndexCollection(books: BookEntity[]) {
    const booksIndex: BookIndexRecord[] = books.map((book) => {
      return this.toBookIndexRecord(book);
    });

    return booksIndex;
  }
}
