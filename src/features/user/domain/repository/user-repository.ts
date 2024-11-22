import { BaseRepository } from "@src/features/shared/domain/repository/base-repository";
import { type UserEntity } from "../entities/user";
import { SessionDTO } from "../../../auth/domain/dtos/session-dto";

export abstract class UserRepository
  implements BaseRepository<UserEntity, string>
{
  findById(id: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<UserEntity[]> {
    throw new Error("Method not implemented.");
  }

  create(data: any): Promise<UserEntity> {
    throw new Error("Method not implemented. Yet");
  }

  update( data: any): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<string|null> {
    throw new Error("Method not implemented.");
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented. yet");
  }
}
