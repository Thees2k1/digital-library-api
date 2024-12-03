import { AuthorEntity } from '../../domain/entities/author-entity';

export class AuthorMapper {
  static toAuthorDetailDto(author: AuthorEntity) {
    return {
      id: author.id,
      name: author.name,
      avatar: author.avatar,
      country: author.country,
      birthDate: author.birthDate,
      deathDate: author.deathDate,
      age: author.age,
      bio: author.bio,
      bookCount: author.booksCount,
    };
  }
}
