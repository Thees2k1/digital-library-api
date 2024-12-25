export const DI_TYPES = {
  UserRepository: Symbol.for('UserRepository'),
  AuthRepository: Symbol.for('AuthRepository'),
  AuthorRepository: Symbol.for('AuthorRepository'),
  CategoryRepository: Symbol.for('CategoryRepository'),
  PublisherRepository: Symbol.for('PublisherRepository'),
  GenreRepository: Symbol.for('GenreRepository'),
  SerieRepository: Symbol.for('SerieRepository'),
  BookRepository: Symbol.for('BookRepository'),

  UserService: Symbol.for('UserService'),
  AuthorService: Symbol.for('AuthorService'),
  AuthService: Symbol.for('AuthService'),
  CategoryService: Symbol.for('CategoryService'),
  PublisherService: Symbol.for('PublisherService'),
  GenreService: Symbol.for('GenreService'),
  SerieService: Symbol.for('SerieService'),
  BookService: Symbol.for('BookService'),

  UserController: Symbol.for('UserController'),
  AuthController: Symbol.for('AuthController'),
  AuthorController: Symbol.for('AuthorController'),
  CategoryController: Symbol.for('CategoryController'),
  PublisherController: Symbol.for('PublisherController'),
  GenreController: Symbol.for('GenreController'),
  SerieController: Symbol.for('SerieController'),
  BookController: Symbol.for('BookController'),

  PrismaClient: Symbol.for('PrismaClient'),

  Logger: Symbol.for('Logger'),
  Mailer: Symbol.for('Mailer'),
  MessageBroker: Symbol.for('MessageBroker'),
};
