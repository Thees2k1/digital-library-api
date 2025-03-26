import { inject, injectable } from 'inversify';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { DI_TYPES } from '@src/core/di/types';
import logger from '@src/core/utils/logger/logger';
import { AppError } from '@src/core/errors/custom-error';

@injectable()
export class CleanupSessionsUseCase {
  constructor(
    @inject(DI_TYPES.AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(): Promise<number> {
    try {
      await this.authRepository.cleanupExpiredSessions();
      logger.info('Successfully cleaned up expired sessions');
      return 1; // Can return count if you modify repository to return it
    } catch (error) {
      logger.error('Failed to cleanup sessions:', error);
      throw AppError.internalServer('Failed to cleanup expired sessions');
    }
  }
}
