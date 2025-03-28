import { CleanupSessionsUseCase } from '../cleanup-session-usecase';
import { AuthRepository } from '../../../domain/repository/auth-repository';
import { NotificationService } from '@src/core/interfaces/notification-service';
import { MetricsService } from '@src/core/interfaces/mertric-service';
import { mockDeep } from 'jest-mock-extended';
import logger from '@src/core/utils/logger/logger';
import { AppError } from '@src/core/errors/custom-error';

jest.mock('@src/core/utils/logger/logger');

describe('CleanupSessionsUseCase', () => {
  let cleanupSessionsUseCase: CleanupSessionsUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let notificationService: jest.Mocked<NotificationService>;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(() => {
    authRepository = mockDeep<AuthRepository>();
    notificationService = mockDeep<NotificationService>();
    metricsService = mockDeep<MetricsService>();

    cleanupSessionsUseCase = new CleanupSessionsUseCase(
      authRepository,
      notificationService,
      metricsService,
    );
  });

  it('should clean up expired sessions and record metrics', async () => {
    authRepository.cleanupExpiredSessions.mockResolvedValue(10);

    const result = await cleanupSessionsUseCase.execute();

    expect(result).toBe(10);
    expect(authRepository.cleanupExpiredSessions).toHaveBeenCalled();
    expect(metricsService.recordCleanupJob).toHaveBeenCalledWith(
      10,
      expect.any(Number),
    );
    expect(notificationService.sendAdminAlert).toHaveBeenCalledWith(
      expect.stringContaining('Cleaned up 10 expired sessions'),
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Successfully cleaned up 10 expired sessions',
    );
  });

  it('should not send an admin alert if no sessions were cleaned up', async () => {
    authRepository.cleanupExpiredSessions.mockResolvedValue(0);

    const result = await cleanupSessionsUseCase.execute();

    expect(result).toBe(0);
    expect(authRepository.cleanupExpiredSessions).toHaveBeenCalled();
    expect(metricsService.recordCleanupJob).toHaveBeenCalledWith(
      0,
      expect.any(Number),
    );
    expect(notificationService.sendAdminAlert).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Successfully cleaned up 0 expired sessions',
    );
  });

  it('should handle errors during cleanup and send system alerts', async () => {
    const error = new Error('Database error');
    authRepository.cleanupExpiredSessions.mockRejectedValue(error);

    await expect(cleanupSessionsUseCase.execute()).rejects.toThrow(
      AppError.internalServer('Failed to cleanup expired sessions'),
    );

    expect(metricsService.recordCleanupFailure).toHaveBeenCalled();
    expect(notificationService.sendSystemAlert).toHaveBeenCalledWith(
      'Session cleanup job failed - check logs for details',
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to cleanup sessions:',
      error,
    );
  });
});
