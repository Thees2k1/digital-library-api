// import { BookEntity } from '../../domain/entities/book-entity';
// import { BookDetailDto, BookIndexRecord, BookList } from '../dtos/book-dto';

// export class BookMapper {
//   static toBookDetailDto(book: BookEntity) {
//     return {
//       id: book.id,
//       title: book.title,
//       cover: book.cover,
//       pages: book.pages,
//       language: book.language,
//       description: book.description,
//       averageRating: book.averageRating,
//       author: {
//         id: book.author.id,
//         avatar: book.author.avatar,
//         name: book.author.name,
//         bio: book.author.bio,
//       },
//       publisher: {
//         id: book.publisher ? book.publisher.id : null,
//         name: book.publisher ? book.publisher.name : null,
//       },
//       category: {
//         id: book.category?.id,
//         name: book.category?.name,
//       },
//       genres: book.genres?.map((genre) => {
//         return {
//           id: genre.id,
//           name: genre.name,
//         };
//       }),
//       digitalItems: book.digitalItems?.map((item) => {
//         return {
//           format: item.format,
//           url: item.url,
//         };
//       }),
//       releaseDate: book.releaseDate?.toISOString(),
//       updateAt: book.updatedAt?.toISOString(),
//     } as BookDetailDto;
//   }

//   static toBooks(books: BookEntity[]): BookList {
//     return books.map((book) => {
//       return {
//         id: book.id,
//         title: book.title,
//         cover: book.cover,
//         author: book.author,
//         createdAt: book.createdAt.toDateString(),
//         averageRating: book.averageRating,
//       };
//     });
//   }

//   static toBookIndexRecord(book: BookEntity): BookIndexRecord {
//     return {
//       id: book.id,
//       title: book.title,
//       releaseDate: book.releaseDate?.toISOString(),
//       authorName: book.author.name,
//       categoryName: book.category?.name,
//       rating: book.averageRating,
//       genres: book.genres?.map((genre) => genre.name) || [],
//     } as BookIndexRecord;
//   }

//   static toBookIndexCollection(books: BookEntity[]) {
//     const booksIndex: BookIndexRecord[] = books.map((book) => {
//       return this.toBookIndexRecord(book);
//     });

//     return booksIndex;
//   }
// }
