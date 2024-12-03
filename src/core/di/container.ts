import { PrismaClient } from '@prisma/client';
import { JwtService } from '@src/core/services/jwt-service';
import { AuthInteractor } from '@src/features/auth/application/interactor/auth-interactor';
import { AuthUseCase } from '@src/features/auth/application/use-cases/auth-use-case';
import { AuthRepository } from '@src/features/auth/domain/repository/auth-repository';
import { PersistenceAuthRepository } from '@src/features/auth/infrastructure/repository/persitence-auth-repository';
import { AuthController } from '@src/features/auth/presentation/controller/auth-controller';
import { AuthorInteractor } from '@src/features/author/application/interactor/author-interactor';
import { IAuthorInteractor } from '@src/features/author/application/interactor/interfaces/interactor';
import { AuthorRepository } from '@src/features/author/domain/repository/author-repository';
import { PersistenceAuthorRepository } from '@src/features/author/infrastructure/repository/persistence-author-repository';
import { AuthorController } from '@src/features/author/presentation/controller/author-controller';
import { CategoryService } from '@src/features/category/application/use-cases/category-service';
import { CategoryRepository } from '@src/features/category/domain/repository/category-repository';
import { PersistenceCategoryRepository } from '@src/features/category/infrastructure/repository/persistence-category-repository';
import { CategoryController } from '@src/features/category/presentation/controller/category-controller';
import { UserInteractor } from '@src/features/user/application/interactor/user-interactor';
import { UserUseCase } from '@src/features/user/application/use-cases/user-use-case';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import { PersistenceUserRepository } from '@src/features/user/infrastructure/repository/persitence-user-repository';
import { UserController } from '@src/features/user/presentation/controller/user-controller';
import { Container } from 'inversify';
import { DI_TYPES } from './types';
import { ICategoryService } from '@src/features/category/application/use-cases/interfaces/category-service-interface';
import { PublisherRepository } from '@src/features/publisher/domain/repository/publisher-repository';
import { PersistencePublisherRepository } from '@src/features/publisher/infrastructure/repository/persistence-publisher-repository';
import { IPublisherService } from '@src/features/publisher/application/use-cases/interfaces/publisher-service-interface';
import { PublisherService } from '@src/features/publisher/application/use-cases/publisher-service';
import { PublisherController } from '@src/features/publisher/presentation/controller/publisher-controller';

// import { RedisService } from "../services/redis-service";

export const container = new Container();

export function initializeInfrastucture() {
  //binding services
  container
    .bind<PrismaClient>(DI_TYPES.PrismaClient)
    .toConstantValue(new PrismaClient());
  // container.bind<RedisService>(RedisService).toSelf();
  container.bind<JwtService>(JwtService).toSelf();

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

  //binding use cases
  container.bind<UserUseCase>(DI_TYPES.UserInteractor).to(UserInteractor);
  container.bind<AuthUseCase>(DI_TYPES.AuthUseCase).to(AuthInteractor);
  container
    .bind<IAuthorInteractor>(DI_TYPES.AuthorInteractor)
    .to(AuthorInteractor);
  container
    .bind<ICategoryService>(DI_TYPES.CategoryService)
    .to(CategoryService);
  container
    .bind<IPublisherService>(DI_TYPES.PublisherService)
    .to(PublisherService);

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
}
