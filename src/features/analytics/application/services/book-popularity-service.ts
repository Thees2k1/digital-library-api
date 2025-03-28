import { inject, injectable } from 'inversify';
import cron from 'node-cron';
import logger from '@src/core/utils/logger/logger';
import { BookRepository } from '@src/features/book/domain/repository/book-repository';
import { DI_TYPES } from '@src/core/di/types';

@injectable()
export class BookPopularityService {
  private isRunning = false;

  constructor(
    @inject(DI_TYPES.BookRepository) private readonly bookRepo: BookRepository,
  ) {}

  start(): void {
    if (this.isRunning) {
      logger.warn('Book popularity calculation job is already running');
      return;
    }

    // Run every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting book popularity calculation job...');
      try {
        await this.calculatePopularity();
      } catch (error) {
        logger.error('Book popularity calculation job failed:', error);
      }
    });

    this.isRunning = true;
    logger.info(
      'Book popularity calculation job scheduled to run daily at 2 AM',
    );
  }

  private async calculatePopularity(): Promise<void> {
    const books = await this.bookRepo.getAll();
    for (const book of books) {
      const popularityScore =
        book.likes ||
        0 * 2 +
          (book.readCount ?? 0) * 1.5 +
          (book.reviews?.length ?? 0) * 3 +
          (book.reviews
            ? book.reviews.reduce((sum, review) => sum + review.rating, 0) * 4
            : 0);

      await this.bookRepo.updatePopularityScore(book.id, popularityScore);
    }
    logger.info('Book popularity scores updated successfully');
  }

  stop(): void {
    this.isRunning = false;
  }
}
