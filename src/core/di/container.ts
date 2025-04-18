import { PrismaClient } from '@prisma/client';
import { JwtService } from '@src/core/services/jwt-service';
import { BookPopularityService } from '@src/features/analytics/application/services/book-popularity-service';
import { PopularityService } from '@src/features/analytics/application/services/popularity-service';
import { AuthService } from '@src/features/auth/application/use-cases/auth-service';
import { CleanupSessionsUseCase } from '@src/features/auth/application/use-cases/cleanup-session-usecase';
import { IAuthService } from '@src/features/auth/application/use-cases/interfaces/auth-service-interface';
import { AuthRepository } from '@src/features/auth/domain/repository/auth-repository';
import { PersistenceAuthRepository } from '@src/features/auth/infrastructure/repository/persitence-auth-repository';
import { AuthController } from '@src/features/auth/presentation/controller/auth-controller';
import { AuthRouterFactory } from '@src/features/auth/presentation/routes/auth-routes';
import { AuthorService } from '@src/features/author/application/use-cases/author-service';
import { IAuthorService } from '@src/features/author/application/use-cases/interfaces/author-service-interface';
import { AuthorRepository } from '@src/features/author/domain/repository/author-repository';
import { PersistenceAuthorRepository } from '@src/features/author/infrastructure/repository/persistence-author-repository';
import { AuthorController } from '@src/features/author/presentation/controller/author-controller';
import { AuthorRouterFactory } from '@src/features/author/presentation/routes/author-routes';
import { BookService } from '@src/features/book/application/use-cases/book-service';
import { IBookService } from '@src/features/book/application/use-cases/interfaces/book-service-interface';
import { BookRepository } from '@src/features/book/domain/repository/book-repository';
import { IndexingService } from '@src/features/book/infrastructure/index-service';
import { PersistenceBookRepository } from '@src/features/book/infrastructure/repository/persitence-book-repository';
import { BookController } from '@src/features/book/presentation/controller/book-controller';
import { BookRouterFactory } from '@src/features/book/presentation/routes/book-routes';
import { CategoryService } from '@src/features/category/application/use-cases/category-service';
import { ICategoryService } from '@src/features/category/application/use-cases/interfaces/category-service-interface';
import { CategoryRepository } from '@src/features/category/domain/repository/category-repository';
import { PersistenceCategoryRepository } from '@src/features/category/infrastructure/repository/persistence-category-repository';
import { CategoryController } from '@src/features/category/presentation/controller/category-controller';
import { CategoryRouterFactory } from '@src/features/category/presentation/routes/category-routes';
import { GenreService } from '@src/features/genre/application/use-cases/genre-service';
import { IGenreService } from '@src/features/genre/application/use-cases/interfaces/genre-service-interface';
import { GenreRepository } from '@src/features/genre/domain/repository/genre-repository';
import { PersistenceGenreRepository } from '@src/features/genre/infrastructure/repository/persistence-genre-repository';
import { GenreController } from '@src/features/genre/presentation/controller/genre-controller';
import { GenreRouterFactory } from '@src/features/genre/presentation/routes/genre-routes';
import { IPublisherService } from '@src/features/publisher/application/use-cases/interfaces/publisher-service-interface';
import { PublisherService } from '@src/features/publisher/application/use-cases/publisher-service';
import { PublisherRepository } from '@src/features/publisher/domain/repository/publisher-repository';
import { PersistencePublisherRepository } from '@src/features/publisher/infrastructure/repository/persistence-publisher-repository';
import { PublisherController } from '@src/features/publisher/presentation/controller/publisher-controller';
import { PublisherRouterFactory } from '@src/features/publisher/presentation/routes/publisher-routes';
import { ISerieService } from '@src/features/serie/application/use-cases/interfaces/serie-service-interface';
import { SerieService } from '@src/features/serie/application/use-cases/serie-service';
import { SerieRepository } from '@src/features/serie/domain/repository/serie-repository';
import { PersistenceSerieRepository } from '@src/features/serie/infrastructure/repository/persistence-serie-repository';
import { SerieController } from '@src/features/serie/presentation/controller/serie-controller';
import { SerieRouterFactory } from '@src/features/serie/presentation/routes/serie-routes';
import { ITagService } from '@src/features/tag/application/use-cases/interfaces/tag-service-interface';
import { TagService } from '@src/features/tag/application/use-cases/tag-service';
import { TagRepository } from '@src/features/tag/domain/repository/tag-repository';
import { PersistenceTagRepository } from '@src/features/tag/infrastructure/repository/persistence-tag-repository';
import { TagController } from '@src/features/tag/presentation/controller/tag-controller';
import { TagRouterFactory } from '@src/features/tag/presentation/routes/tag-routes';
import { IUserService } from '@src/features/user/application/use-cases/interfaces/user-service-interface';
import { UserService } from '@src/features/user/application/use-cases/user-service';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import { PersistenceUserRepository } from '@src/features/user/infrastructure/repository/persitence-user-repository';
import { UserController } from '@src/features/user/presentation/controller/user-controller';
import { UserRouterFactory } from '@src/features/user/presentation/routes/user-routes';
import { Container } from 'inversify';
import { CacheService } from '../interfaces/cache-service';
import { MetricsService } from '../interfaces/mertric-service';
import { NotificationService } from '../interfaces/notification-service';
import { SearchService } from '../interfaces/search-service';
import { MeiliSearchService } from '../services/meilisearch-service';
import { PrometheusMetricsService } from '../services/metrics-service/prometheus-metrics-service';
import { DiscordNotificationService } from '../services/notification-service/discord-webhook-notification-service';
import { RedisService } from '../services/redis-service';
import { SessionCleanupService } from '../services/session-cleanup-service';
import { DI_TYPES } from './types';

export const container = new Container();

export function initializeInfrastucture() {
  //binding services
  container
    .bind<PrismaClient>(DI_TYPES.PrismaClient)
    .toConstantValue(new PrismaClient());
  container.bind<JwtService>(JwtService).toSelf().inSingletonScope();
  container
    .bind<SearchService>(DI_TYPES.SearchService)
    .to(MeiliSearchService)
    .inSingletonScope();
  container
    .bind<CacheService>(DI_TYPES.CacheService)
    .to(RedisService)
    .inSingletonScope();
  container.bind<IndexingService>(IndexingService).toSelf().inSingletonScope();
  container
    .bind<NotificationService>(DI_TYPES.NotificationService)
    .to(DiscordNotificationService)
    .inSingletonScope();

  // Metrics service
  container
    .bind<MetricsService>(DI_TYPES.MetricsService)
    .to(PrometheusMetricsService)
    .inSingletonScope();

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
    .bind<TagRepository>(DI_TYPES.TagRepository)
    .to(PersistenceTagRepository);
  container
    .bind<SerieRepository>(DI_TYPES.SerieRepository)
    .to(PersistenceSerieRepository);
  container
    .bind<BookRepository>(DI_TYPES.BookRepository)
    .to(PersistenceBookRepository);

  container
    .bind<CleanupSessionsUseCase>(DI_TYPES.CleanupSessionsUseCase)
    .to(CleanupSessionsUseCase)
    .inSingletonScope();
  container
    .bind<SessionCleanupService>(DI_TYPES.SessionCleanupService)
    .to(SessionCleanupService)
    .inSingletonScope();

  //binding services
  container
    .bind<IUserService>(DI_TYPES.UserService)
    .to(UserService)
    .inSingletonScope();
  container
    .bind<IAuthService>(DI_TYPES.AuthService)
    .to(AuthService)
    .inSingletonScope();
  container
    .bind<IAuthorService>(DI_TYPES.AuthorService)
    .to(AuthorService)
    .inSingletonScope();
  container
    .bind<ICategoryService>(DI_TYPES.CategoryService)
    .to(CategoryService)
    .inSingletonScope();
  container
    .bind<IPublisherService>(DI_TYPES.PublisherService)
    .to(PublisherService)
    .inSingletonScope();
  container
    .bind<IGenreService>(DI_TYPES.GenreService)
    .to(GenreService)
    .inSingletonScope();
  container
    .bind<ITagService>(DI_TYPES.TagService)
    .to(TagService)
    .inSingletonScope();
  container
    .bind<ISerieService>(DI_TYPES.SerieService)
    .to(SerieService)
    .inSingletonScope();
  container
    .bind<IBookService>(DI_TYPES.BookService)
    .to(BookService)
    .inSingletonScope();

  container
    .bind<BookPopularityService>(DI_TYPES.BookPopularityService)
    .to(BookPopularityService)
    .inSingletonScope();
  container
    .bind<PopularityService>(DI_TYPES.PopularityService)
    .to(PopularityService)
    .inSingletonScope();

  //binding controllers
  container
    .bind<UserController>(DI_TYPES.UserController)
    .to(UserController)
    .inSingletonScope();
  container
    .bind<AuthController>(DI_TYPES.AuthController)
    .to(AuthController)
    .inSingletonScope();
  container
    .bind<AuthorController>(DI_TYPES.AuthorController)
    .to(AuthorController)
    .inSingletonScope();
  container
    .bind<CategoryController>(DI_TYPES.CategoryController)
    .to(CategoryController)
    .inSingletonScope();
  container
    .bind<PublisherController>(DI_TYPES.PublisherController)
    .to(PublisherController)
    .inSingletonScope();
  container
    .bind<GenreController>(DI_TYPES.GenreController)
    .to(GenreController)
    .inSingletonScope();
  container
    .bind<TagController>(DI_TYPES.TagController)
    .to(TagController)
    .inSingletonScope();
  container
    .bind<SerieController>(DI_TYPES.SerieController)
    .to(SerieController)
    .inSingletonScope();
  container
    .bind<BookController>(DI_TYPES.BookController)
    .to(BookController)
    .inSingletonScope();

  container
    .bind<UserRouterFactory>(DI_TYPES.UserRouter)
    .to(UserRouterFactory)
    .inSingletonScope();

  container
    .bind<BookRouterFactory>(DI_TYPES.BookRouter)
    .to(BookRouterFactory)
    .inSingletonScope();

  container
    .bind<AuthRouterFactory>(DI_TYPES.AuthRouter)
    .to(AuthRouterFactory)
    .inSingletonScope();
  container
    .bind<AuthorRouterFactory>(DI_TYPES.AuthorRouter)
    .to(AuthorRouterFactory)
    .inSingletonScope();
  container
    .bind<CategoryRouterFactory>(DI_TYPES.CategoryRouter)
    .to(CategoryRouterFactory)
    .inSingletonScope();
  container
    .bind<GenreRouterFactory>(DI_TYPES.GenreRouter)
    .to(GenreRouterFactory)
    .inSingletonScope();
  container
    .bind<TagRouterFactory>(DI_TYPES.TagRouter)
    .to(TagRouterFactory)
    .inSingletonScope();
  container
    .bind<PublisherRouterFactory>(DI_TYPES.PublisherRouter)
    .to(PublisherRouterFactory)
    .inSingletonScope();
  container
    .bind<SerieRouterFactory>(DI_TYPES.SerieRouter)
    .to(SerieRouterFactory)
    .inSingletonScope();
}
