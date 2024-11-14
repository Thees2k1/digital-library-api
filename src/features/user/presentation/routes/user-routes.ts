import { Router } from "express";

import { InMemoryUserRepository } from "../../infrastructure/repository/in-memory-user-repository";
import { UserController } from "../controller/user-controller";
import { UserInteractor } from "../../application/interactor/user-interactor";
import { UserUseCase } from "../../domain/use-cases/user-use-case";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { UserRepository } from "../../domain/repository/user-repository";
import { Container } from "inversify";

const container = new Container();
container.bind<UserRepository>(INTERFACE_TYPE.ProductRepository).to(InMemoryUserRepository);
container.bind<UserUseCase>(INTERFACE_TYPE.ProductInteractor).to(UserInteractor);
container.bind<UserController>(INTERFACE_TYPE.ProductController).to(UserController);

export class UserRoutes{
    static get routes(): Router{

        const router = Router();
        const controller = container.get<UserController>(INTERFACE_TYPE.ProductController);
        router.get("/", controller.getAllUsers.bind(controller));

        return router;
    }
}