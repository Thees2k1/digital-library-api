import nodemailer from "nodemailer";
import { IMailer } from "../../domain/service/imailer";

export class NodemailerMailer implements IMailer {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-password",
      },
    });
  }
  async sendMail(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: "your-email@gmail.com",
      to,
      subject,
      text: body,
    });
  }
}
