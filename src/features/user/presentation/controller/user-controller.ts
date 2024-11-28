import { SUCCESSFUL } from '@src/core/constants/constants';
import { AppError } from '@src/core/errors/custom-error';
import { type NextFunction, type Request, type Response } from 'express';
import { inject, injectable } from 'inversify';
import {
  DeleteUserResponse,
  ListUserResponse,
  UpdateUserResponse,
  UserResponse,
} from '../../application/dtos/user-dto';
import { UserUseCase } from '../../application/use-cases/user-use-case';
import logger from '@src/core/utils/logger/logger';
import { DI_TYPES } from '@src/core/di/types';

@injectable()
export class UserController {
  private readonly interactor: UserUseCase;
  constructor(@inject(DI_TYPES.UserInteractor) interactor: UserUseCase) {
    this.interactor = interactor;
  }
  async getAllUsers(
    _: Request,
    res: Response<ListUserResponse>,
    next: NextFunction,
  ) {
    try {
      const users = await this.interactor.getUsers();

      res.status(200).json({
        data: users ?? [],
        message: SUCCESSFUL,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: Request,
    res: Response<UserResponse>,
    next: NextFunction,
  ) {
    try {
      const userId = req.params.id;
      const user = await this.interactor.getUserById(userId);
      if (!user) {
        next(AppError.notFound('User not found.'));
        return;
      }
      res.status(200).json({
        data: user,
        message: SUCCESSFUL,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async getUserByEmail(
    req: Request,
    res: Response<UserResponse>,
    next: NextFunction,
  ) {
    try {
      const email = req.query.email as string;
      if (!email) {
        next(AppError.badRequest('Email is required.'));
        return;
      }
      const user = await this.interactor.getUserByEmail(email);
      if (!user) {
        next(AppError.notFound('User not found.'));
        return;
      }
      res.status(200).json({
        data: user,
        message: SUCCESSFUL,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async createUser(
    req: Request,
    res: Response<UserResponse>,
    next: NextFunction,
  ) {
    try {
      const user = await this.interactor.createUser(req.body);
      if (!user) {
        next(AppError.internalServer('User not created.'));
        return;
      }
      res.status(201).json({
        data: user,
        message: SUCCESSFUL,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response<UpdateUserResponse>,
    next: NextFunction,
  ) {
    try {
      const userId = req.params.id;
      const user = await this.interactor.updateUser(userId, req.body);
      res.status(200).json({
        data: user,
        message: SUCCESSFUL,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async deleteUser(
    req: Request,
    res: Response<DeleteUserResponse>,
    next: NextFunction,
  ) {
    try {
      const userId = req.params.id;
      const user = await this.interactor.deleteUser(userId);
      res.status(200).json({
        data: user,
        message: SUCCESSFUL,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
}
