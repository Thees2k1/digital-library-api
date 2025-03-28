import { inject, injectable } from 'inversify';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { DI_TYPES } from '@src/core/di/types';
import logger from '@src/core/utils/logger/logger';
import { AppError } from '@src/core/errors/custom-error';
import { NotificationService } from '@src/core/interfaces/notification-service';
import { MetricsService } from '@src/core/interfaces/mertric-service';

@injectable()
export class CleanupSessionsUseCase {
  constructor(
    @inject(DI_TYPES.AuthRepository)
    private readonly authRepository: AuthRepository,
    @inject(DI_TYPES.NotificationService)
    private readonly notificationService: NotificationService,
    @inject(DI_TYPES.MetricsService)
    private readonly metricsService: MetricsService,
  ) {}

  async execute(): Promise<number> {
    const startTime = Date.now();

    try {
      const count = await this.authRepository.cleanupExpiredSessions();
      const duration = Date.now() - startTime;

      // Record metrics
      this.metricsService.recordCleanupJob(count, duration);

      // Send notification if significant number cleaned up
      if (count > 0) {
        await this.notificationService.sendAdminAlert(
          `Cleaned up ${count} expired sessions in ${duration}ms`,
        );
      }

      logger.info(`Successfully cleaned up ${count} expired sessions`);
      return count;
    } catch (error) {
      this.metricsService.recordCleanupFailure();
      logger.error('Failed to cleanup sessions:', error);

      await this.notificationService.sendSystemAlert(
        'Session cleanup job failed - check logs for details',
      );

      throw AppError.internalServer('Failed to cleanup expired sessions');
    }
  }
}
