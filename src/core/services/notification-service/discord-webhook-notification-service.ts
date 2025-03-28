// @src/infrastructure/services/discord-notification-service.ts
import { injectable } from 'inversify';
import axios from 'axios';
import { NotificationService } from '@src/core/interfaces/notification-service';
import { config } from '@src/core/config/config';

@injectable()
export class DiscordNotificationService implements NotificationService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = config.discordWebhookUrl;
  }
  async sendSystemAlert(message: string): Promise<void> {
    await axios.post(this.webhookUrl, {
      content: `🔔 **System Alert**: ${message}`,
    });
  }

  async sendAdminAlert(message: string): Promise<void> {
    await axios.post(this.webhookUrl, {
      content: `🔔 **Admin Alert**: ${message}`,
    });
  }
}
