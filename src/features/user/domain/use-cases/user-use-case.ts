import { type UserEntity as User } from "../entities/user";

export interface UserUseCase {
  createUser(user: User): Promise<User | null>;
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(user: User): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
}
