import { injectable } from 'inversify';
import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { CacheService } from '../interfaces/cache-service';
import logger from '../utils/logger/logger';

const DEFAULT_CACHE_EXPIRATION = 60 * 60; // 1 hour

const DEFAULT_CACHE_OPTIONS = {
  EX: DEFAULT_CACHE_EXPIRATION,
};
@injectable()
export class RedisService implements CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    const url = config.redisUrl;

    this.client = createClient({ url });

    this.client.on('error', () => {
      if (this.isConnected) {
        this.isConnected = false;
      }
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
      this.isConnected = true;
    });

    this.client.connect().catch((err) => {
      logger.error(`Failed to connect to Redis: ${err.message}`);
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

  async set<T>(key: string, value: T, options: { EX: number }): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis is not connected. Skipping cache.');
      return;
    }
    if (!options) {
      options = DEFAULT_CACHE_OPTIONS;
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
