// @src/infrastructure/services/email-notification-service.ts
import { injectable } from 'inversify';
import logger from '@src/core/utils/logger/logger';
import { NotificationService } from '../../interfaces/notification-service';

@injectable()
export class EmailNotificationService implements NotificationService {
  async sendAdminAlert(message: string): Promise<void> {
    try {
      // Implement actual email sending logic here
      logger.info(`[Email Alert to Admin]: ${message}`);
    } catch (error) {
      logger.error('Failed to send admin email notification:', error);
      throw error;
    }
  }

  async sendSystemAlert(message: string): Promise<void> {
    // Similar implementation for system alerts
  }
}
