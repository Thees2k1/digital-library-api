export class AuthorEntity {
  constructor(
    public id: string,
    public name: string,
    public avatar: string | null,
    public birthDate: Date,
    public deathDate: Date | null,
    public country: string,
    public bio: string,
    public createdAt: Date,
    public updatedAt: Date,
    public books: Book[],
  ) {}

  get age(): number {
    return new Date().getFullYear() - this.birthDate.getFullYear();
  }

  static get fullName(): string {
    return this.name;
  }
  get booksCount(): number {
    return this.books.length;
  }

  get latestBook(): Book {
    return this.books.sort(
      (a, b) => b.releaseDate.getTime() - a.releaseDate.getTime(),
    )[0];
  }

  get firstBook(): Book {
    return this.books.sort(
      (a, b) => a.releaseDate.getTime() - b.releaseDate.getTime(),
    )[0];
  }

  addBook(book: Book): void {
    this.books.push(book);
  }

  removeBook(book: Book): void {
    this.books = this.books.filter((b) => b.id !== book.id);
  }

  updateBook(book: Book): void {
    this.books = this.books.map((b) => (b.id === book.id ? book : b));
  }

  copyWith(updates: Partial<AuthorEntity>): AuthorEntity {
    return new AuthorEntity(
      updates.id || this.id,
      updates.name || this.name,
      updates.avatar || this.avatar,
      updates.birthDate || this.birthDate,
      updates.deathDate || this.deathDate,
      updates.country || this.country,
      updates.bio || this.bio,
      updates.createdAt || this.createdAt,
      updates.updatedAt || this.updatedAt,
      updates.books || this.books,
    );
  }
}

export interface Book {
  id: number;
  title: string;
  cover: string;
  releaseDate: Date;
}
