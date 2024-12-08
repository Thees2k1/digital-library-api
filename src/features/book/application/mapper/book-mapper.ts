import { BookEntity } from '../../domain/entities/book-entity';
import { BookDetailDto } from '../dtos/book-dto';

export class BookMapper {
  static toBookDetailDto(book: BookEntity) {
    return {
      id: book.id,
      title: book.title,
      cover: book.cover,
      pages: book.pages,
      language: book.language,
      description: book.description,
      author: {
        id: book.author.id,
        name: book.author.name,
      },
      publisher: book.publisher && {
        id: book.publisher.id,
        name: book.publisher.name,
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
      digitalItems: book.digitalItems.map((item) => {
        return {
          format: item.format,
          url: item.url,
        };
      }),
      releaseDate: book.releaseDate?.toISOString(),
      updateAt: book.updatedAt.toISOString(),
    } as BookDetailDto;
  }
}
