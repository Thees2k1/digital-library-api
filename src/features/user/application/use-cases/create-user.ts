import { BaseUseCase } from "@src/features/shared/domain/use-case/base-use-case";
import { UserRepository } from "../../domain/repository/user-repository";
import { CreateUserDto } from "../dtos/user-dto";
import { UserEntity } from "../../domain/entities/user";

export abstract class CreateUserUseCase implements BaseUseCase<CreateUserDto,UserEntity> {
  constructor(
    private userRepository: UserRepository
  ) {}
    async execute(param : CreateUserDto): Promise<UserEntity> {
       return this.userRepository.create(param);
    }
}