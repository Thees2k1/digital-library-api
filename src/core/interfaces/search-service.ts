export interface SearchService {
  index<T extends object>(data: {
    indexName: string;
    documents: T[];
  }): Promise<void>;
  search<T extends object>(
    query: string,
    options?: SearchOptions,
  ): Promise<SearchResponse<T>>;
  delete(data: any): Promise<void>;
}

export interface SearchOptions {
  indexName: string;
  params?: {
    offset?: number;
    limit?: number;
    [key: string]: any;
  };
}

export interface SearchResponse<T> {
  hits: T[];
  offset: number;
  limit: number;
  query: string;
  total: number;
}
