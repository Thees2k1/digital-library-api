import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { Router } from "express";
import { AuthController } from "../controller/auth-controller";
import { container } from "@src/features/shared/infrastructure/utils/inversify-config";
import { validate } from "@src/features/shared/application/middlewares/validate";
import { RegisterBodySchema } from "../../application/dtos/register-dto";
import { LoginBodySchema } from "../../application/dtos/login-dto";

class AuthRoutes{
  static login = "/login";
  static register = "/register";
  static refreshToken = "/refresh-token";
  static logout = "/logout";
}

export class AuthRouter {
  static get routes(): Router {
    const router = Router();
    const controller = container.get<AuthController>(
      INTERFACE_TYPE.AuthController
    );
    router.post(AuthRoutes.register,validate(RegisterBodySchema), controller.register.bind(controller));
    router.post(AuthRoutes.login, validate(LoginBodySchema),controller.login.bind(controller));
    router.get(AuthRoutes.refreshToken, controller.refreshToken.bind(controller));
    router.get(AuthRoutes.logout, controller.logout.bind(controller));
    return router;
  }
}
