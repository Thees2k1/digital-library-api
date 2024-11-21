import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { Router } from "express";
import { AuthController } from "../controller/auth-controller";
import { container } from "@src/features/shared/infrastructure/utils/inversify-config";
import { validate } from "@src/features/shared/application/middlewares/validate";
import { RegisterBodySchema } from "../../domain/dtos/register-dto";
import { LoginBodySchema } from "../../domain/dtos/login-dto";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = container.get<AuthController>(
      INTERFACE_TYPE.AuthController
    );
    router.post("/register",validate(RegisterBodySchema), controller.register.bind(controller));
    router.post("/login", validate(LoginBodySchema),controller.login.bind(controller));
    return router;
  }
}
