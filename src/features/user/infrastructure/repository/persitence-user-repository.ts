import { Like, LikeStatus, Prisma, PrismaClient } from '@prisma/client';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { inject, injectable } from 'inversify';
import { CreateUserDto } from '../../application/dtos/user-dto';
import { UserEntity } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repository/user-repository';
import { user_role } from '@Prisma/client';

@injectable()
export class PersistenceUserRepository extends UserRepository {
  private readonly prismaClient: PrismaClient;

  constructor(@inject(DI_TYPES.PrismaClient) prismaClient: PrismaClient) {
    super();
    this.prismaClient = prismaClient;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const res = await this.prismaClient.user.findFirst({
      select: {
        id: true, // userId
        firstName: true,
        lastName: true,
        avatar: true,
        identity: {
          // Join với UserIdentity
          select: {
            email: true,
            password: true,
            role: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      where: {
        identity: {
          email: email,
        },
      },
    });

    if (!res) {
      return null;
    }

    if (!res.identity) {
      throw AppError.internalServer('User identity not found');
    }

    const transformedId = res.id;

    const data = new UserEntity(
      transformedId,
      res.firstName,
      res.lastName,
      res.identity.email,
      res.avatar ?? '',
      res.identity.password,
      res.identity.role,
      res.createdAt,
      res.updatedAt,
    );

    return data;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const transformedId = id;
    const res = await this.prismaClient.user.findFirst({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        identity: {
          select: {
            email: true,
            password: true,
            role: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      where: {
        id: transformedId,
      },
    });

    if (!res) {
      return null;
    }

    if (!res.identity) {
      throw AppError.internalServer('User identity not found');
    }

    const data: UserEntity = new UserEntity(
      res.id,
      res.firstName,
      res.lastName,
      res.identity.email,
      res.avatar ?? '',
      res.identity.password,
      res.identity.role,
      res.createdAt,
      res.updatedAt,
    );

    return data;
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const newUser = await this.prismaClient.$transaction(async (prisma) => {
      // Create the User first
      const userRole: user_role = data.role === 'admin' ? 'admin' : 'user'; // Default to 'user' if not provided
      const userInfo = {
        firstName: data.firstName,
        lastName: data.lastName || '',
        avatar: data.avatar || '',
      };
      const user = await prisma.user.create({
        data: userInfo,
      });

      // Create the UserIdentity related to the created User
      const userIdentity = await prisma.userIdentity.create({
        data: {
          email: data.email,
          password: data.password, // Make sure to hash the password properly
          role: userRole,
          user: {
            connect: { id: user.id }, // Connect to the user created above
          },
        },
      });

      // Return the created User and UserIdentity info
      return {
        user,
        userIdentity,
      };
    });

    const res = new UserEntity(
      newUser.user.id,
      newUser.user.firstName,
      newUser.user.lastName,
      newUser.userIdentity.email,
      newUser.user.avatar ?? '',
      newUser.userIdentity.password,
      newUser.userIdentity.role,
      newUser.user.createdAt,
      newUser.user.updatedAt,
    );
    return res;
  }

  async findAll(): Promise<UserEntity[]> {
    const res = await this.prismaClient.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        identity: {
          select: {
            email: true,
            password: true,
            role: true,
          },
        },
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (res.length === 0) {
      return [];
    }

    const users: UserEntity[] = res.map((user) => {
      if (!user.identity) {
        throw AppError.internalServer('User identity not found');
      }

      return new UserEntity(
        user.id,
        user.firstName,
        user.lastName,
        user.identity.email,
        user.avatar ?? '',
        user.identity.password,
        user.identity.role,
        user.createdAt,
        user.updatedAt,
      );
    });

    return users;
  }

  async update(id: string, data: UserEntity): Promise<string> {
    const updatedUser = await this.prismaClient.$transaction(async (prisma) => {
      // Update User table
      const transformedId = id;
      const user = await prisma.user.update({
        where: { id: transformedId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName ?? '',
          avatar: data.avatarUrl ?? '',
          updatedAt: data.updatedAt,
        },
      });

      // Update UserIdentity table
      const userIdentity = await prisma.userIdentity.update({
        where: { userId: transformedId },
        data: {
          email: data.email,
          password: data.password, // Make sure the password is already hashed
        },
      });

      // Return the updated User and UserIdentity info
      return {
        user,
        userIdentity,
      };
    });

    return updatedUser.user.id;
  }

  async delete(id: string): Promise<string> {
    const userId = id;
    // Wrap deletion in a transaction to ensure both deletions happen atomically
    const deletedUser = await this.prismaClient.$transaction(async (prisma) => {
      // First, delete the associated UserIdentity
      await prisma.userIdentity.delete({
        where: { userId: userId },
      });

      // Then, delete the User
      await prisma.userSession.deleteMany({
        where: { userId: userId },
      });
      await prisma.like.deleteMany({
        where: { userId: userId },
      });
      await prisma.userFavoriteBook.deleteMany({
        where: { userId: userId },
      });
      await prisma.userPreference.deleteMany({
        where: { userId: userId },
      });
      await prisma.review.deleteMany({
        where: { userId: userId },
      });
      const user = await prisma.user.delete({
        where: { id: userId },
      });

      return user; // Return the deleted user information if needed
    });

    return deletedUser.id;
  }

  async getBookLikes(
    id: string,
  ): Promise<{ bookIds: Array<string>; count: number }> {
    const userLikedBooks = await this.prismaClient.like.findMany({
      select: {
        bookId: true,
      },
      where: {
        userId: id,
        status: LikeStatus.liked,
      },
    });

    const bookIds = userLikedBooks.map((like) => like.bookId);

    return {
      bookIds: bookIds,
      count: bookIds.length,
    };
  }

  async getUserPreferences(userId: string): Promise<Record<string, string>> {
    const preferences = await this.prismaClient.userPreference.findMany({
      where: { userId },
      select: { key: true, value: true },
    });

    return preferences.reduce(
      (acc, pref) => {
        acc[pref.key] = pref.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  async addUserPreference(
    userId: string,
    key: string,
    value: string,
  ): Promise<void> {
    await this.prismaClient.userPreference.upsert({
      where: { userId_key: { userId, key } },
      update: { value },
      create: { userId, key, value },
    });
  }

  async deleteUserPreference(userId: string, key: string): Promise<void> {
    await this.prismaClient.userPreference.delete({
      where: { userId_key: { userId, key } },
    });
  }
}
