import { Router } from 'express';
import { AuthController } from '../controller/auth-controller';
import { RegisterBodySchema } from '../../application/dtos/register-dto';
import { LoginBodySchema } from '../../application/dtos/login-dto';
import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';

class AuthRoutes {
  static login = '/login';
  static register = '/register';
  static refreshToken = '/refresh-token';
  static logout = '/logout';
  static checkSession = '/check-session';
}

export class AuthRouter {
  static get routes(): Router {
    const router = Router();
    const controller = container.get<AuthController>(DI_TYPES.AuthController);
    router.post(
      AuthRoutes.register,
      validationMiddleware(RegisterBodySchema),
      controller.register.bind(controller),
    );
    router.post(
      AuthRoutes.login,
      validationMiddleware(LoginBodySchema),
      controller.login.bind(controller),
    );
    router.post(
      AuthRoutes.refreshToken,
      controller.refreshToken.bind(controller),
    );
    router.post(AuthRoutes.logout, controller.logout.bind(controller));
    router.get(
      AuthRoutes.checkSession,
      controller.checkSession.bind(controller),
    );
    return router;
  }
}
