import { GetListOptions } from '../types';
export interface Repository<ID, T, O> {
  getList(params: O): Promise<T[]>;
  getById(id: ID): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<void>;
  delete(id: ID): Promise<void>;
  count(filter: any): Promise<number>;
}

export interface BaseRepository<X, T, ID extends string | number> {
  create(input: X): Promise<T>;
  update(id: ID, data: T): Promise<string | null>;
  delete(id: ID): Promise<ID | null>;
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
}
