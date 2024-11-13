import { BaseRepository } from "@src/features/shared/domain/repository/base-repository";
import {type UserEntity } from "../entities/user";

export abstract class UserRepository implements BaseRepository<UserEntity, number> {
  findById(
    id: number
  ): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<
   UserEntity[]
  > {
    throw new Error("Method not implemented.");
  }

  create(entity: UserEntity): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }
  update(entity: UserEntity): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }
  delete(id: number): Promise<UserEntity> {
    throw new Error("Method not implemented.");
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
}
