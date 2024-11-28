interface AuthorRepository {
  getAuthors(): Promise<AuthorEntity[]>;
  getAuthorById(id: string): Promise<AuthorEntity>;
  createAuthor(author: Partial<AuthorEntity>): Promise<AuthorEntity>;
  updateAuthor(author: Partial<AuthorEntity>): Promise<AuthorEntity>;
  deleteAuthor(id: string): Promise<string>;
}
