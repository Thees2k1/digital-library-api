// @src/infrastructure/services/slack-notification-service.ts
import { injectable } from 'inversify';
import logger from '@src/core/utils/logger/logger';
import { NotificationService } from '@src/core/interfaces/notification-service';

@injectable()
export class SlackNotificationService implements NotificationService {
  sendSystemAlert(message: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async sendAdminAlert(message: string): Promise<void> {
    try {
      // Implement Slack webhook logic here
      logger.info(`[Slack Alert to Admin]: ${message}`);
    } catch (error) {
      logger.error('Failed to send Slack notification:', error);
    }
  }
}
