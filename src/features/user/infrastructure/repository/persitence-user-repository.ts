import { PrismaClient, User } from "@prisma/client";
import { UserEntity } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repository/user-repository";
import { inject, injectable } from "inversify";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import {
  binaryToUuid,
  uuidToBinary,
} from "@src/features/shared/infrastructure/utils/utils";
import { CreateUserDto, UpdateUserDto } from "../../domain/dtos/user-dto";
import { AppError } from "@src/core/errors/custom-error";

@injectable()
export class PersistenceUserRepository extends UserRepository {
  private readonly prismaClient: PrismaClient;

  constructor(@inject(INTERFACE_TYPE.PrismaClient) prismaClient: PrismaClient) {
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
      id,
      res.firstName,
      res.lastName,
      res.identity.email,
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
      const userInfor = {
        firstName: data.firstName,
        lastName: data.lastName || "",
        avatar: data.avatar || "",
      };
      const user = await prisma.user.create({
        data: userInfor,
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
      newUser.userIdentity.password,
      "user",
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
          createdAt: true,
          updatedAt: true,
        },
      });

      const users: UserEntity[] = res.map((user) => {
        if (!user.identity) {
          throw AppError.internalServer("User identity not found");
        }

        return new UserEntity(
          binaryToUuid(user.id),
          user.firstName,
          user.lastName,
          user.identity.email,
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

  async update(data: UpdateUserDto): Promise<UserEntity | null> {
    try {
      const updatedUser = await this.prismaClient.$transaction(
        async (prisma) => {
          // Update User table
          const transformedId = uuidToBinary(data.id);
          const user = await prisma.user.update({
            where: { id: transformedId },
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              avatar: data.avatar,
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

      const res = new UserEntity(
        data.id,
        updatedUser.user.firstName,
        updatedUser.user.lastName,
        updatedUser.userIdentity.email,
        updatedUser.userIdentity.password,
        "user",
        updatedUser.user.createdAt,
        updatedUser.user.updatedAt
      );

      return res;
    } catch (error) {
      console.error("Error updating user:", error);
      throw AppError.internalServer("Failed to update user");
    }
  }

  async delete(id: string): Promise<string | null> {
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

      console.log("User and associated identity deleted successfully");
      return binaryToUuid(deletedUser.id);
    } catch (e) {
      console.error("Error updating user:", e);
      throw AppError.internalServer("Failed to delete user");
    }
  }
}
