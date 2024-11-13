export interface BaseRepository<T, ID> {
   create(entity: T): Promise<T>;
   update(entity: T): Promise<T>;
   delete(id: ID): Promise<T>;
   findById(id: ID): Promise<T>;
   findAll(): Promise<T[]>;
}