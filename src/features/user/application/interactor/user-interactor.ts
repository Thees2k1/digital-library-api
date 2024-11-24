import { inject, injectable } from "inversify";
import { UserEntity } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repository/user-repository";
import { UserUseCase } from "../../domain/use-cases/user-use-case";
import { INTERFACE_TYPE } from "@src/core/constants/constants";

@injectable()
export class UserInteractor implements UserUseCase {
  private repository: UserRepository;

  constructor(@inject(INTERFACE_TYPE.UserRepository) userRepository: UserRepository) {
    this.repository = userRepository;
  }
    getUsers(): Promise<UserEntity[]> {
      return this.repository.findAll();
    }
    createUser(user: UserEntity): Promise<UserEntity | null> {
        return this.repository.create(user);
    }
    getUserById(id: number): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }
    getUserByEmail(email: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }
    updateUser(user: UserEntity): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }
    deleteUser(id: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }

  }