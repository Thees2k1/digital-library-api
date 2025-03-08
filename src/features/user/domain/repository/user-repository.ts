import { BaseRepository } from '@src/core/interfaces/base-repository';
import { CreateUserDto } from '../../application/dtos/user-dto';
import { type UserEntity } from '../entities/user';

export abstract class UserRepository
  implements BaseRepository<CreateUserDto, UserEntity, string>
{
  findById(id: string): Promise<UserEntity | null> {
    throw new Error('Method not implemented.');
  }
  findAll(): Promise<UserEntity[]> {
    throw new Error('Method not implemented.');
  }

  create(data: CreateUserDto): Promise<UserEntity> {
    throw new Error('Method not implemented. Yet');
  }

  update(id: string, data: UserEntity): Promise<string> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    throw new Error('Method not implemented. yet');
  }

  getBookLikes(id: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
