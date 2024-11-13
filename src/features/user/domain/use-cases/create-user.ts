import { BaseUseCase } from "@src/features/shared/domain/use-case/base-use-case";
import { UserRepository } from "../repository/user-repository";
import {type UserEntity as User } from "../entities/user";

export abstract class CreateUserUseCase implements BaseUseCase<User,User> {
  constructor(
    private userRepository: UserRepository
  ) {}
    async execute(param : User): Promise<User> {
       return this.userRepository.create(param);
    }
}