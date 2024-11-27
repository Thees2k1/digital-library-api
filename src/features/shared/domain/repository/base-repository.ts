export interface BaseRepository<X,T, ID extends string | number> {
   create(input: X): Promise<T>;
   update(id:ID,data: X): Promise<T|null>;
   delete(id: ID): Promise<ID | null>;
   findById(id: ID): Promise<T|null>;
   findAll(): Promise<T[]>;
}