export interface NotificationService {
  sendAdminAlert(message: string): Promise<void>;
  sendSystemAlert(message: string): Promise<void>;
}
