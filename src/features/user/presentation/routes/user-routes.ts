import { Router } from "express";

import { InMemoryUserRepository } from "../../infrastructure/repository/in-memory-user-repository";
import { UserController } from "../../application/user-controller";

export class UserRoutes{
    static get routes(): Router{

        const router = Router();
        const repository = new InMemoryUserRepository();
        const controller = new UserController(repository);
        router.get("/", controller.getAllUsers.bind(controller));

        return router;
    }
}