import { Router } from "express";
import { UserController } from "../controller/user-controller";
import { CreateUserSchema, UpdateUserSchema } from "../../application/dtos/user-dto";
import { container } from "@src/core/di/container";
import { DI_TYPES } from "@src/core/di/types";
import { authMiddleware } from "@src/features/auth/infrastructure/middleware/auth-middleware";
import { validationMiddleware } from "@src/core/middlewares/validation-middleware";
export class UserRouter{ 
    static get routes(): Router{
        const path = "/users";
        const router = Router();
        const controller = container.get<UserController>(DI_TYPES.UserController);
        router.get("/user",controller.getUserByEmail.bind(controller));
        router.get(path,authMiddleware, controller.getAllUsers.bind(controller));
        router.get(`${path}/:id`,controller.getUserById.bind(controller));
        router.patch(`${path}/:id`,validationMiddleware(UpdateUserSchema), controller.updateUser.bind(controller));
        router.delete(`${path}/:id`, controller.deleteUser.bind(controller));
        router.post(`${path}/:id`,validationMiddleware(CreateUserSchema), controller.createUser.bind(controller));
        return router;
    }
}