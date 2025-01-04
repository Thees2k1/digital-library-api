import { PrismaClient } from '@prisma/client';
import { JwtService } from '@src/core/services/jwt-service';
import { AuthService } from '@src/features/auth/application/use-cases/auth-service';
import { IAuthService } from '@src/features/auth/application/use-cases/interfaces/auth-service-interface';
import { AuthRepository } from '@src/features/auth/domain/repository/auth-repository';
import { PersistenceAuthRepository } from '@src/features/auth/infrastructure/repository/persitence-auth-repository';
import { AuthController } from '@src/features/auth/presentation/controller/auth-controller';
import { AuthorService } from '@src/features/author/application/use-cases/author-service';
import { IAuthorService } from '@src/features/author/application/use-cases/interfaces/author-service-interface';
import { AuthorRepository } from '@src/features/author/domain/repository/author-repository';
import { PersistenceAuthorRepository } from '@src/features/author/infrastructure/repository/persistence-author-repository';
import { AuthorController } from '@src/features/author/presentation/controller/author-controller';
import { BookService } from '@src/features/book/application/use-cases/book-service';
import { IBookService } from '@src/features/book/application/use-cases/interfaces/book-service-interface';
import { BookRepository } from '@src/features/book/domain/repository/book-repository';
import { PersistenceBookRepository } from '@src/features/book/infrastructure/repository/persitence-book-repository';
import { BookController } from '@src/features/book/presentation/controller/book-controller';
import { CategoryService } from '@src/features/category/application/use-cases/category-service';
import { ICategoryService } from '@src/features/category/application/use-cases/interfaces/category-service-interface';
import { CategoryRepository } from '@src/features/category/domain/repository/category-repository';
import { PersistenceCategoryRepository } from '@src/features/category/infrastructure/repository/persistence-category-repository';
import { CategoryController } from '@src/features/category/presentation/controller/category-controller';
import { GenreService } from '@src/features/genre/application/use-cases/genre-service';
import { IGenreService } from '@src/features/genre/application/use-cases/interfaces/genre-service-interface';
import { GenreRepository } from '@src/features/genre/domain/repository/genre-repository';
import { PersistenceGenreRepository } from '@src/features/genre/infrastructure/repository/persistence-genre-repository';
import { GenreController } from '@src/features/genre/presentation/controller/genre-controller';
import { IPublisherService } from '@src/features/publisher/application/use-cases/interfaces/publisher-service-interface';
import { PublisherService } from '@src/features/publisher/application/use-cases/publisher-service';
import { PublisherRepository } from '@src/features/publisher/domain/repository/publisher-repository';
import { PersistencePublisherRepository } from '@src/features/publisher/infrastructure/repository/persistence-publisher-repository';
import { PublisherController } from '@src/features/publisher/presentation/controller/publisher-controller';
import { ISerieService } from '@src/features/serie/application/use-cases/interfaces/serie-service-interface';
import { SerieService } from '@src/features/serie/application/use-cases/serie-service';
import { SerieRepository } from '@src/features/serie/domain/repository/serie-repository';
import { PersistenceSerieRepository } from '@src/features/serie/infrastructure/repository/persistence-serie-repository';
import { SerieController } from '@src/features/serie/presentation/controller/serie-controller';
import { IUserService } from '@src/features/user/application/use-cases/interfaces/user-service-interface';
import { UserService } from '@src/features/user/application/use-cases/user-service';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import { PersistenceUserRepository } from '@src/features/user/infrastructure/repository/persitence-user-repository';
import { UserController } from '@src/features/user/presentation/controller/user-controller';
import { Container } from 'inversify';
import { DI_TYPES } from './types';
import { SearchService } from '../interfaces/search-service';
import { MeiliSearchService } from '../services/meilisearch-service';

// import { RedisService } from "../services/redis-service";

export const container = new Container();

export function initializeInfrastucture() {
  //binding services
  container
    .bind<PrismaClient>(DI_TYPES.PrismaClient)
    .toConstantValue(new PrismaClient());
  // container.bind<RedisService>(RedisService).toSelf();
  container.bind<JwtService>(JwtService).toSelf();
  container.bind<SearchService>(DI_TYPES.SearchService).to(MeiliSearchService);

  //binding repositories
  container
    .bind<UserRepository>(DI_TYPES.UserRepository)
    .to(PersistenceUserRepository);
  container
    .bind<AuthRepository>(DI_TYPES.AuthRepository)
    .to(PersistenceAuthRepository);
  container
    .bind<AuthorRepository>(DI_TYPES.AuthorRepository)
    .to(PersistenceAuthorRepository);
  container
    .bind<CategoryRepository>(DI_TYPES.CategoryRepository)
    .to(PersistenceCategoryRepository);
  container
    .bind<PublisherRepository>(DI_TYPES.PublisherRepository)
    .to(PersistencePublisherRepository);
  container
    .bind<GenreRepository>(DI_TYPES.GenreRepository)
    .to(PersistenceGenreRepository);
  container
    .bind<SerieRepository>(DI_TYPES.SerieRepository)
    .to(PersistenceSerieRepository);
  container
    .bind<BookRepository>(DI_TYPES.BookRepository)
    .to(PersistenceBookRepository);

  //binding services
  container.bind<IUserService>(DI_TYPES.UserService).to(UserService);
  container.bind<IAuthService>(DI_TYPES.AuthService).to(AuthService);
  container.bind<IAuthorService>(DI_TYPES.AuthorService).to(AuthorService);
  container
    .bind<ICategoryService>(DI_TYPES.CategoryService)
    .to(CategoryService);
  container
    .bind<IPublisherService>(DI_TYPES.PublisherService)
    .to(PublisherService);
  container.bind<IGenreService>(DI_TYPES.GenreService).to(GenreService);
  container.bind<ISerieService>(DI_TYPES.SerieService).to(SerieService);
  container.bind<IBookService>(DI_TYPES.BookService).to(BookService);

  //binding controllers
  container.bind<UserController>(DI_TYPES.UserController).to(UserController);
  container.bind<AuthController>(DI_TYPES.AuthController).to(AuthController);
  container
    .bind<AuthorController>(DI_TYPES.AuthorController)
    .to(AuthorController);
  container
    .bind<CategoryController>(DI_TYPES.CategoryController)
    .to(CategoryController);
  container
    .bind<PublisherController>(DI_TYPES.PublisherController)
    .to(PublisherController);
  container.bind<GenreController>(DI_TYPES.GenreController).to(GenreController);
  container.bind<SerieController>(DI_TYPES.SerieController).to(SerieController);
  container.bind<BookController>(DI_TYPES.BookController).to(BookController);
}
