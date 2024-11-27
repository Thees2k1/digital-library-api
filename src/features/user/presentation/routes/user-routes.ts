import { Router } from "express";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { container } from "@src/features/shared/infrastructure/utils/inversify-config";
import { UserController } from "../controller/user-controller";
import { authenticate } from "@src/features/shared/application/middlewares/authenticate";
import { validate } from "@src/features/shared/application/middlewares/validate";
import { CreateUserSchema, UpdateUserSchema } from "../../application/dtos/user-dto";
export class UserRouter{ 
    static get routes(): Router{
        const path = "/users";
        const router = Router();
        const controller = container.get<UserController>(INTERFACE_TYPE.UserController);
        router.get("/user",controller.getUserByEmail.bind(controller));
        router.get(path,authenticate, controller.getAllUsers.bind(controller));
        router.get(`${path}/:id`,controller.getUserById.bind(controller));
        router.patch(`${path}/:id`,validate(UpdateUserSchema), controller.updateUser.bind(controller));
        router.delete(`${path}/:id`, controller.deleteUser.bind(controller));
        router.post(`${path}/:id`,validate(CreateUserSchema), controller.createUser.bind(controller));
        return router;
    }
}