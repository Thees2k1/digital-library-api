export const DI_TYPES = {
  UserRepository: Symbol.for('UserRepository'),
  AuthRepository: Symbol.for('AuthRepository'),
  AuthorRepository: Symbol.for('AuthorRepository'),
  CategoryRepository: Symbol.for('CategoryRepository'),
  PublisherRepository: Symbol.for('PublisherRepository'),

  UserInteractor: Symbol.for('UserInteractor'),
  AuthorInteractor: Symbol.for('AuthorInteractor'),
  AuthUseCase: Symbol.for('AuthUseCase'),
  CategoryService: Symbol.for('CategoryService'),
  PublisherService: Symbol.for('PublisherService'),

  UserController: Symbol.for('UserController'),
  AuthController: Symbol.for('AuthController'),
  AuthorController: Symbol.for('AuthorController'),
  CategoryController: Symbol.for('CategoryController'),
  PublisherController: Symbol.for('PublisherController'),

  PrismaClient: Symbol.for('PrismaClient'),

  Logger: Symbol.for('Logger'),
  Mailer: Symbol.for('Mailer'),
  MessageBroker: Symbol.for('MessageBroker'),
};
