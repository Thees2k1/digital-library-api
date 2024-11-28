import { Container } from 'inversify';
import { AuthInteractor } from '@src/features/auth/application/interactor/auth-interactor';
import { AuthUseCase } from '@src/features/auth/application/use-cases/auth-use-case';
import { AuthController } from '@src/features/auth/presentation/controller/auth-controller';
import { UserInteractor } from '@src/features/user/application/interactor/user-interactor';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import { UserUseCase } from '@src/features/user/application/use-cases/user-use-case';
import { PersistenceUserRepository } from '@src/features/user/infrastructure/repository/persitence-user-repository';
import { UserController } from '@src/features/user/presentation/controller/user-controller';
import { AuthRepository } from '@src/features/auth/domain/repository/auth-repository';
import { PersistenceAuthRepository } from '@src/features/auth/infrastructure/repository/persitence-auth-repository';
import { PrismaClient } from '@prisma/client';
import { DI_TYPES } from './types';
import { JwtService } from '@src/core/services/jwt-service';

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

  //binding use cases
  container.bind<UserUseCase>(DI_TYPES.UserInteractor).to(UserInteractor);
  container.bind<AuthUseCase>(DI_TYPES.AuthUseCase).to(AuthInteractor);

  //binding controllers
  container.bind<UserController>(DI_TYPES.UserController).to(UserController);
  container.bind<AuthController>(DI_TYPES.AuthController).to(AuthController);
}
