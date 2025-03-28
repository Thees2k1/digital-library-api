import { Router } from 'express';
import { AuthController } from '../controller/auth-controller';
import { RegisterBodySchema } from '../../application/dtos/register-dto';
import { LoginBodySchema } from '../../application/dtos/login-dto';
import { container } from '@src/core/di/container';
import { DI_TYPES } from '@src/core/di/types';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { inject, injectable } from 'inversify';

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
