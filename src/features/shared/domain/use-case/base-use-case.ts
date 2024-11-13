
export interface BaseUseCase<T,X> {
  execute(param : T): Promise<X>;
}
