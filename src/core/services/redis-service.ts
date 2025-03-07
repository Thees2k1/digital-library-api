import { createClient, RedisClientType } from 'redis';
import { CacheService } from '../interfaces/cache-service';
import { config } from '../config/config';
import { injectable } from 'inversify';

@injectable()
export class RedisService implements CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    const url = config.redisUrl;
    console.log(`Connecting to Redis at ${url}`);

    this.client = createClient({ url });

    this.client.on('error', (err) => {
      console.error(`Redis Client Error: ${err.message}`);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
      this.isConnected = true;
    });

    this.client.connect().catch((err) => {
      console.error(`Failed to connect to Redis: ${err.message}`);
      this.isConnected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      console.warn('Redis is not connected. Skipping cache.');
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err: any) {
      console.error(`Redis GET error: ${err.message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: { EX: number }): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis is not connected. Skipping cache.');
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), options);
    } catch (error: any) {
      console.error(`Redis SET error: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis is not connected. Skipping cache.');
      return;
    }

    try {
      await this.client.del(key);
    } catch (err: any) {
      console.error(`Redis DELETE error: ${err.message}`);
    }
  }
}
