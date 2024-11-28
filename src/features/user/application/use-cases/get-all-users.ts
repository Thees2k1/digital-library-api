import { UserEntity } from "../../domain/entities/user";
import { BaseUseCase } from "@src/core/interfaces/base-use-case";
import { UserRepository } from "../../domain/repository/user-repository";

export class GetAllUsers implements BaseUseCase<void, UserEntity[]> {
  constructor(private readonly userRepository: UserRepository) {
  }

  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }
}