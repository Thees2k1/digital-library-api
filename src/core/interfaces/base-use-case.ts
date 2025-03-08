export interface BaseUseCase<Q, T, X> {
  getList(query: Q): Promise<Array<T> | object>;
  getById(id: X): Promise<T | null>;
  create(data: object): Promise<T>;
  update(id: X, data: object): Promise<X>;
  delete(id: X): Promise<X>;
}
