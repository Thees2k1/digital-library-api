import { DI_TYPES } from '@src/core/di/types';
import { BaseRouterFactory } from '@src/core/interfaces/base-router-factory';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import {
  CreateUserSchema,
  UpdateUserSchema,
} from '../../application/dtos/user-dto';
import { UserController } from '../controller/user-controller';

export class UserRoutes {
  static readonly userByEmail = '/user';
  static readonly users = '/users';
  static readonly user = '/users/:id';
  static readonly currentUser = '/users/me';
  static readonly currentUserPreferences = `/users/me/preferences`;
  static readonly likedBooks = '/users/me/liked-books';
  static readonly userPreferences = '/users/:id/preferences';
  static readonly userPreference = '/users/:id/preferences/:key';
}

@injectable()
export class UserRouterFactory extends BaseRouterFactory<UserController> {
  constructor(@inject(DI_TYPES.UserController) controller: UserController) {
    super(controller);
  }
  setupRoutes(): void {
    this._router.get(
      UserRoutes.userByEmail,
      authMiddleware,
      this.controller.getUserByEmail.bind(this.controller),
    );
    this._router.get(
      UserRoutes.users,
      authMiddleware,
      this.controller.getAllUsers.bind(this.controller),
    );
    this._router.get(
      UserRoutes.currentUser,
      authMiddleware,
      this.controller.getCurrentUser.bind(this.controller),
    );
    this._router.get(
      UserRoutes.currentUserPreferences,
      authMiddleware,
      this.controller.getUserPreferences.bind(this.controller),
    );
    this._router.post(
      UserRoutes.currentUserPreferences,
      authMiddleware,
      this.controller.addUserPreference.bind(this.controller),
    );
    this._router.delete(
      UserRoutes.currentUserPreferences,
      authMiddleware,
      this.controller.deleteUserPreference.bind(this.controller),
    );
    this._router.get(
      UserRoutes.user,
      this.controller.getUserById.bind(this.controller),
    );
    this._router.post(
      UserRoutes.users,
      authMiddleware,
      validationMiddleware(CreateUserSchema),
      this.controller.createUser.bind(this.controller),
    );
    this._router.patch(
      UserRoutes.user,
      authMiddleware,
      validationMiddleware(UpdateUserSchema),
      this.controller.updateUser.bind(this.controller),
    );
    this._router.delete(
      UserRoutes.user,
      authMiddleware,
      this.controller.deleteUser.bind(this.controller),
    );

    this._router.get(
      UserRoutes.likedBooks,
      authMiddleware,
      this.controller.getBookLikes.bind(this.controller),
    );

    this._router.get(
      UserRoutes.userPreferences,
      authMiddleware,
      this.controller.getUserPreferences.bind(this.controller),
    );
    this._router.post(
      UserRoutes.userPreferences,
      authMiddleware,
      this.controller.addUserPreference.bind(this.controller),
    );
    this._router.delete(
      UserRoutes.userPreference,
      authMiddleware,
      this.controller.deleteUserPreference.bind(this.controller),
    );
  }
  get router(): Router {
    return this._router;
  }
}
