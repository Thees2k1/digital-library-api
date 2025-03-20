import { inject, injectable } from 'inversify';
import { DI_TYPES } from '@src/core/di/types';
import { eventEmitter, EVENTS } from '@src/core/events';
import {
  BookDetailDto,
  BookIndexRecord,
} from '@src/features/book/application/dtos/book-dto';
import { SearchService } from '@src/core/interfaces/search-service';
import { BookRepository } from '../domain/repository/book-repository';
// import { BookMapper } from '../application/mapper/book-mapper';
import { BookEntity } from '../domain/entities/book-entity';
import logger from '@src/core/utils/logger/logger';

@injectable()
export class IndexingService {
  constructor(
    @inject(DI_TYPES.SearchService) private searchService: SearchService,
    @inject(DI_TYPES.BookRepository) private bookRepository: BookRepository,
  ) {
    this.setupListeners();
  }

  private setupListeners(): void {
    eventEmitter.on(EVENTS.NEED_INDEXING, this.handleEvent.bind(this));
  }

  private handleEvent = (
    data: BookEntity | { id: string; action: 'delete' },
  ) => {
    if ('action' in data && data.action === 'delete') {
      // Handle deletion
      this.searchService.delete({
        indexName: 'books',
        id: data.id,
      });
    } else {
      const indexData = BookEntity.toBookIndexRecord(data as BookEntity);
      this.searchService.index({
        indexName: 'books',
        documents: [indexData],
      });
    }
  };

  async reindexAllBooks(): Promise<void> {
    try {
      const books = await this.bookRepository.getAllBooks();

      const documents = BookEntity.toBookIndexCollection(books);

      // Index all books
      await this.searchService.index({
        indexName: 'books',
        documents,
      });
    } catch (error) {
      logger.error('Error reindexing all books', error);
    }
  }
}
