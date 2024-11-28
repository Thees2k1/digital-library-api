export interface IMailer {
  sendMail(to: string, subject: string, body: string): Promise<void>;
}
