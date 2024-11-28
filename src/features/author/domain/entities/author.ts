class AuthorEntity {
  constructor(
    private id: number,
    public name: string,
    public birthdate: Date,
    public bio: string,
    public createdAt: Date,
    public updatedAt: Date,
    public books: BookEntity[],
  ) {}

  get age(): number {
    return new Date().getFullYear() - this.birthdate.getFullYear();
  }

  get fullName(): string {
    return this.name;
  }

  get shortBio(): string {
    return this.bio.substring(0, 100);
  }

  get booksCount(): number {
    return this.books.length;
  }

  get latestBook(): BookEntity {
    return this.books.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];
  }

  get firstBook(): BookEntity {
    return this.books.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )[0];
  }

  addBook(book: BookEntity): void {
    this.books.push(book);
  }

  removeBook(book: BookEntity): void {
    this.books = this.books.filter((b) => b.id !== book.id);
  }

  updateBook(book: BookEntity): void {
    this.books = this.books.map((b) => (b.id === book.id ? book : b));
  }

  static create(data: AuthorEntity): AuthorEntity {
    return new AuthorEntity(
      data.id,
      data.name,
      data.birthdate,
      data.bio,
      data.createdAt,
      data.updatedAt,
      data.books,
    );
  }
}
