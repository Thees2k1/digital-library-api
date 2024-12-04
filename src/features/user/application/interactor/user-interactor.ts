import { AppError } from '@src/core/errors/custom-error';
import logger from '@src/core/utils/logger/logger';
import { inject, injectable } from 'inversify';
import { UserRepository } from '../../domain/repository/user-repository';
import { CreateUserDto, UpdateUserDto, User } from '../dtos/user-dto';
import { UserUseCase } from '../use-cases/user-use-case';
import { DI_TYPES } from '@src/core/di/types';
import argon2 from 'argon2';

@injectable()
export class UserInteractor implements UserUseCase {
  private repository: UserRepository;

  constructor(@inject(DI_TYPES.UserRepository) userRepository: UserRepository) {
    this.repository = userRepository;
  }
  async getUsers(): Promise<User[]> {
    try {
      const usersData = await this.repository.findAll();
      const users: User[] = usersData.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName || '',
        avatarUrl: user.avatarUrl,
      }));

      return users;
    } catch (error) {
      if (error instanceof Error) {
        throw AppError.internalServer(error.message);
      }
      throw error;
    }
  }
  async createUser(data: CreateUserDto): Promise<User | null> {
    try {
      const userExist = await this.repository.findByEmail(data.email);
      if (userExist) {
        throw AppError.forbidden('User already exist');
      }
      const hashedPassword = await argon2.hash(data.password);
      const input: CreateUserDto = {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
        role: data.role,
      };

      const userData = await this.repository.create(input);
      const userCreated: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        avatarUrl: userData.avatarUrl,
      };
      return userCreated;
    } catch (error) {
      logger.error(`Error: ${error}`);
      throw error;
    }
  }
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        return null;
      }
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName || '',
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw AppError.internalServer(error.message);
      }
      throw error;
    }
  }
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userData = await this.repository.findByEmail(email);
      if (!userData) {
        return null;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        avatarUrl: userData.avatarUrl,
      };

      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw AppError.internalServer(error.message);
      }
      throw error;
    }
  }
  async updateUser(id: string, updateData: UpdateUserDto): Promise<string> {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        throw AppError.badRequest('User not found');
      }

      user.email = updateData.email || user.email;
      user.password = updateData.password || user.password;
      user.firstName = updateData.firstName || user.firstName;
      user.lastName = updateData.lastName || user.lastName;
      user.avatarUrl = updateData.avatar || user.avatarUrl;
      user.role =
        updateData.role === 'user' || updateData.role === 'admin'
          ? updateData.role
          : user.role;
      user.updatedAt = new Date();

      const res = await this.repository.update(id, user);
      return res;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
        throw AppError.internalServer('Cannot update user');
      }
      logger.error(error);
      throw error;
    }
  }
  async deleteUser(id: string): Promise<string> {
    try {
      const res = await this.repository.delete(id);

      return res;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
        throw AppError.internalServer('Cannot delete user');
      }
      logger.error(error);
      throw error;
    }
  }
}
