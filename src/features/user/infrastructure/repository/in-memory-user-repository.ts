import { UserEntity } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repository/user-repository';

const USERS_MOCK = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'jon@gmail.com',
    password: '123456',
    permission: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@gmail.com',
    password: '123456',
    permission: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
export class InMemoryUserRepository extends UserRepository {
  getUserPreferences(userId: string): Promise<Record<string, string>> {
    throw new Error('Method not implemented.');
  }
  addUserPreference(userId: string, key: string, value: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteUserPreference(userId: string, key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super();
  }
  async findAll(): Promise<UserEntity[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(USERS_MOCK.map((user) => UserEntity.fromJson(user)));
      }, 1000);
    });
  }
}
