// @src/infrastructure/services/console-notification-service.ts
import { NotificationService } from '@src/core/interfaces/notification-service';
import { injectable } from 'inversify';

@injectable()
export class ConsoleNotificationService implements NotificationService {
  async sendAdminAlert(message: string): Promise<void> {
    console.log(`[ADMIN ALERT] ${message}`);
  }

  async sendSystemAlert(message: string): Promise<void> {
    console.log(`[SYSTEM ALERT] ${message}`);
  }
}
