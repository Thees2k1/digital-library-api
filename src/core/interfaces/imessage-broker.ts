export interface IMessageBroker {
  publish(queue: string, message: string): Promise<void>;
  subscribe(topic: string, callback: (message: string) => void): void;
}
