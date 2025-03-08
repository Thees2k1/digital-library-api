export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(
    key: string,
    value: T,
    options?: { EX?: number; PX?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
}
