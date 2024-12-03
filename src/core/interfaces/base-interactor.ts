export abstract class BaseInteractor {
  abstract execute(): Promise<void>;
}

export interface Interactor<T, X> {
  getList(): Promise<Array<T>>;
  getById(id: X): Promise<T | null>;
  create(data: object): Promise<T>;
  update(id: X, data: object): Promise<X>;
  delete(id: X): Promise<X>;
}
