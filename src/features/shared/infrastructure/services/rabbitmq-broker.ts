// infrastructure/services/RabbitMQBroker.ts
import { IMessageBroker } from "../../domain/service/imessage-broker";
import amqp from "amqplib";

export class RabbitMQBroker implements IMessageBroker {
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  constructor() {
    this.init();
  }

  private async init() {
    this.connection = await amqp.connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
  }

  async publish(topic: string, message: any): Promise<void> {
    await this.channel.assertQueue(topic);
    this.channel.sendToQueue(topic, Buffer.from(JSON.stringify(message)));
  }

  subscribe(topic: string, callback: (message: any) => void): void {
    this.channel.assertQueue(topic).then(() => {
      this.channel.consume(topic, (msg:any) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel.ack(msg);
        }
      });
    });
  }
}
