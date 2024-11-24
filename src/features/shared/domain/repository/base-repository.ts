export interface BaseRepository<T, ID extends string | number> {
   create(entity: T): Promise<T>;
   update(id:ID,entity: T): Promise<T|null>;
   delete(id: ID): Promise<ID | null>;
   findById(id: ID): Promise<T|null>;
   findAll(): Promise<T[]>;
}