import { CreateUserDto, UpdateUserDto, User } from '../../dtos/user-dto';

export interface IUserService {
  createUser(user: CreateUserDto): Promise<User | null>;
  getUsers(): Promise<User[] | null>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updateData: UpdateUserDto): Promise<string>;
  deleteUser(id: string): Promise<string>;
}
