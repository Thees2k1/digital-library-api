import { DI_TYPES } from '@src/core/di/types';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { LoginBodySchema } from '../../application/dtos/login-dto';
import { RegisterBodySchema } from '../../application/dtos/register-dto';
import { AuthController } from '../controller/auth-controller';

class AuthRoutes {
  static login = '/login';
  static register = '/register';
  static refreshToken = '/refresh-token';
  static logout = '/logout';
}

@injectable()
export class AuthRouterFactory extends BaseRouterFactory<AuthController> {
  constructor(@inject(DI_TYPES.AuthController) controller: AuthController) {
    super(controller);
  }

  setupRoutes(): void {
    this._router.post(
      AuthRoutes.register,
      validationMiddleware(RegisterBodySchema),
      this.controller.register.bind(this.controller),
    );
    this._router.post(
      AuthRoutes.login,
      validationMiddleware(LoginBodySchema),
      this.controller.login.bind(this.controller),
    );
    this._router.post(
      AuthRoutes.refreshToken,
      this.controller.refreshToken.bind(this.controller),
    );
    this._router.post(
      AuthRoutes.logout,
      this.controller.logout.bind(this.controller),
    );
  }
  get routes(): Router {
    return this._router;
  }
}
