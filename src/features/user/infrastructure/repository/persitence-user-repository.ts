import { PrismaClient } from "@prisma/client";
import { AppError } from "@src/core/errors/custom-error";
import {
  binaryToUuid,
  uuidToBinary,
} from "@src/core/utils/utils";
import { inject, injectable } from "inversify";
import { CreateUserDto, UpdateUserDto } from "../../application/dtos/user-dto";
import { UserEntity } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repository/user-repository";
import { DI_TYPES } from "@src/core/di/types";

@injectable()
export class PersistenceUserRepository extends UserRepository {
  private readonly prismaClient: PrismaClient;

  constructor(@inject(DI_TYPES.PrismaClient) prismaClient: PrismaClient) {
    super();
    this.prismaClient = prismaClient;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
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
        throw AppError.internalServer("User identity not found");
      }

      const transformedId = binaryToUuid(res.id);

      const data = new UserEntity(
        transformedId,
        res.firstName,
        res.lastName,
        res.identity.email,
        res.avatar ??'' ,
        res.identity.password,
        res.identity.role,
        res.createdAt,
        res.updatedAt
      );

      return data;
    } catch (e) {
      throw e;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const transformedId = uuidToBinary(id);
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
      throw AppError.internalServer("User identity not found");
    }

    const data: UserEntity = new UserEntity(
      binaryToUuid(res.id),
      res.firstName,
      res.lastName,
      res.identity.email,
      res.avatar ??'' ,
      res.identity.password,
      res.identity.role,
      res.createdAt,
      res.updatedAt
    );

    return data;
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const newUser = await this.prismaClient.$transaction(async (prisma) => {
      // Create the User first
      const userInfo = {
        firstName: data.firstName,
        lastName: data.lastName || "",
        avatar: data.avatar || "",
      };
      const user = await prisma.user.create({
        data: userInfo,
      });

      // Create the UserIdentity related to the created User
      const userIdentity = await prisma.userIdentity.create({
        data: {
          email: data.email,
          password: data.password, // Make sure to hash the password properly
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
      binaryToUuid(newUser.user.id),
      newUser.user.firstName,
      newUser.user.lastName,
      newUser.userIdentity.email,
      newUser.user.avatar ??'' ,
      newUser.userIdentity.password,
      newUser.userIdentity.role,
      newUser.user.createdAt,
      newUser.user.updatedAt
    );
    return res;
  }

  async findAll(): Promise<UserEntity[]> {
    try {
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
          throw AppError.internalServer("User identity not found");
        }

        return new UserEntity(
          binaryToUuid(user.id),
          user.firstName,
          user.lastName,
          user.identity.email,
          user.avatar ?? "",
          user.identity.password,
          user.identity.role,
          user.createdAt,
          user.updatedAt
        );
      });

      return users;
    } catch (e) {
      throw e;
    }
  }

  async update(id:string,data: UserEntity): Promise<string> {
    try {
      const updatedUser = await this.prismaClient.$transaction(
        async (prisma) => {
          // Update User table
          const transformedId = uuidToBinary(id);
          const user = await prisma.user.update({
            where: { id: transformedId },
            data: {
              firstName: data.firstName,
              lastName: data.lastName??'',
              avatar: data.avatarUrl??'',
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
        }
      );

      return binaryToUuid(updatedUser.user.id);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<string> {
    try {
      const userId = uuidToBinary(id);
      // Wrap deletion in a transaction to ensure both deletions happen atomically
      const deletedUser = await this.prismaClient.$transaction(
        async (prisma) => {
          // First, delete the associated UserIdentity
          await prisma.userIdentity.delete({
            where: { userId: userId },
          });

          // Then, delete the User
          const user = await prisma.user.delete({
            where: { id: userId },
          });

          return user; // Return the deleted user information if needed
        }
      );

      return binaryToUuid(deletedUser.id);
    } catch (e) {
      throw e;
    }
  }
}
