
export interface BaseUseCase<X,T> {
  execute(param : X): Promise<T>;
}
