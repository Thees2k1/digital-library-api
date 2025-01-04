import { injectable } from 'inversify';
import { Index, MeiliSearch, SearchParams, SearchResponse } from 'meilisearch';
import { config } from '../config/config';
import {
  SearchResponse as ISearchResponse,
  SearchOptions,
  SearchService,
} from '../interfaces/search-service';

@injectable()
export class MeiliSearchService implements SearchService {
  private client: MeiliSearch;

  constructor() {
    this.client = new MeiliSearch({
      host: config.meilisearchHost,
      apiKey: config.meilisearchApiKey,
    });
  }

  async ensureIndex(indexName: string): Promise<void> {
    const indexes = await this.client.getIndexes();
    const indexExists = indexes.results.some(
      (index) => index.uid === indexName,
    );

    if (!indexExists) {
      await this.client.createIndex(indexName);
    }
  }

  private getIndex(indexName: string): Index {
    return this.client.index(indexName);
  }

  async index<T extends object>(data: {
    indexName: string;
    documents: T[];
  }): Promise<void> {
    await this.ensureIndex(data.indexName);
    const index = this.getIndex(data.indexName);
    await index.addDocuments(data.documents);
  }

  async search<T extends object>(
    query: string,
    options?: SearchOptions,
  ): Promise<ISearchResponse<T>> {
    const indexName = options?.indexName || 'books';
    await this.ensureIndex(indexName);
    const index = this.getIndex(indexName);

    const params = {
      ...options,
      offset: options?.params?.offset || 0,
      limit: options?.params?.limit || 20,
    };

    const result = (await index.search<T>(query, {
      limit: params.limit,
      offset: params.offset,
    })) as SearchResponse<T, SearchParams>;

    console.log(result);

    return {
      query: result.query,
      hits: result.hits,
      offset: result.offset,
      limit: result.limit,
      total: result.estimatedTotalHits || 0,
    } satisfies ISearchResponse<T>;
  }

  async delete(data: { indexName: string; id: string }): Promise<void> {
    const index = this.getIndex(data.indexName);
    await index.deleteDocument(data.id);
  }
}
