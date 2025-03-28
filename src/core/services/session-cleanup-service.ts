// @src/core/services/session-cleanup.service.ts
import { inject, injectable } from 'inversify';
import cron from 'node-cron';

import { DI_TYPES } from '@src/core/di/types';
import logger from '@src/core/utils/logger/logger';
import { CleanupSessionsUseCase } from '@src/features/auth/application/use-cases/cleanup-session-usecase';

@injectable()
export class SessionCleanupService {
  private isRunning = false;

  constructor(
    @inject(DI_TYPES.CleanupSessionsUseCase)
    private readonly cleanupSessionsUseCase: CleanupSessionsUseCase,
  ) {}

  start(): void {
    if (this.isRunning) {
      logger.warn('Session cleanup job is already running');
      return;
    }

    // Run every day at 3 AM
    cron.schedule('0 3 * * *', async () => {
      logger.info('Starting session cleanup job...');
      try {
        await this.cleanupSessionsUseCase.execute();
      } catch (error) {
        logger.error('Session cleanup job failed:', error);
      }
    });

    this.isRunning = true;
    logger.info('Session cleanup job scheduled to run daily at 3 AM');
  }

  stop(): void {
    // You can implement this if you need to stop the job
    this.isRunning = false;
  }
}
