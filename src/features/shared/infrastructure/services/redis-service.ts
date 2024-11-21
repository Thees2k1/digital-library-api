import { createClient } from "redis";

interface RedisArguments {
  key: string;
  value: string;
  timeType: string;
  time: number;
}
export class RedisService {
  private readonly client;
  constructor() {
    this.client = createClient();
  }

  async set({key,value,timeType,time}:RedisArguments) {
   
    await this.client.connect();
    await this.client.set(key,value,{EX:time});
    await this.client.disconnect();
  }

  async get(key:string) {
    await this.client.connect();
    const result = await this.client.get(key);
    await this.client.disconnect();
    return result;
  }
}

export default new RedisService();
