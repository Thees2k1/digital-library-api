import { Container } from "inversify";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { AuthInteractor } from "@src/features/auth/application/interactor/auth-interactor";
import { AuthUseCase } from "@src/features/auth/application/use-cases/auth-use-case";
import { AuthController } from "@src/features/auth/presentation/controller/auth-controller";
import { UserInteractor } from "@src/features/user/application/interactor/user-interactor";
import { UserRepository } from "@src/features/user/domain/repository/user-repository";
import { UserUseCase } from "@src/features/user/application/use-cases/user-use-case";
import { PersistenceUserRepository } from "@src/features/user/infrastructure/repository/persitence-user-repository";
import { UserController } from "@src/features/user/presentation/controller/user-controller";
import { AuthRepository } from "@src/features/auth/domain/repository/auth-repository";
import { PersistenceAuthRepository } from "@src/features/auth/infrastructure/repository/persitence-auth-repository";
import { PrismaClient } from "@prisma/client";

// import { RedisService } from "../services/redis-service";
import { JwtService } from "../services/jwt-service";
import { Logger } from "winston";
import logger from "./logger/logger";

export const container = new Container();

export function initializeInfrastucture() {
  //binding services
  container
    .bind<PrismaClient>(INTERFACE_TYPE.PrismaClient)
    .toConstantValue(new PrismaClient());
  container.bind<Logger>(INTERFACE_TYPE.Logger).toConstantValue(logger);
  // container.bind<RedisService>(RedisService).toSelf();
  container
    .bind<JwtService>(JwtService).toSelf();


  //binding repositories
  container
    .bind<UserRepository>(INTERFACE_TYPE.UserRepository)
    .to(PersistenceUserRepository);
  container
    .bind<AuthRepository>(INTERFACE_TYPE.AuthRepository)
    .to(PersistenceAuthRepository);

  //binding use cases
  container.bind<UserUseCase>(INTERFACE_TYPE.UserInteractor).to(UserInteractor);
  container.bind<AuthUseCase>(INTERFACE_TYPE.AuthUseCase).to(AuthInteractor);

  //binding controllers
  container
    .bind<UserController>(INTERFACE_TYPE.UserController)
    .to(UserController);
  container
    .bind<AuthController>(INTERFACE_TYPE.AuthController)
    .to(AuthController);
}
