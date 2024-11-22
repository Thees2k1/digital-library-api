import { Router } from "express";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { container } from "@src/features/shared/infrastructure/utils/inversify-config";
import { UserController } from "../controller/user-controller";
import { authenticate } from "@src/features/shared/application/middlewares/authenticate";
export class UserRouter{ 
    static get routes(): Router{
        const path = "/users";
        const router = Router();
        const controller = container.get<UserController>(INTERFACE_TYPE.UserController);
        router.get(path,authenticate, controller.getAllUsers.bind(controller));
        return router;
    }
}