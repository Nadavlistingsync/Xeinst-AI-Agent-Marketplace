import { Redis } from '@upstash/redis';
import { AppError } from './error-handling';

const redis = Redis.fromEnv();
const DEFAULT_TTL = 60 * 5; // 5 minutes

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export class Cache {
  private static instance: Cache;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  private generateKey(key: string, tags?: string[]): string {
    if (!tags?.length) return key;
    return `${tags.join(':')}:${key}`;
  }

  async get<T>(key: string, tags?: string[]): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, tags);
      const data = await this.redis.get(cacheKey);
      return data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = DEFAULT_TTL, tags = [] } = options;
      const cacheKey = this.generateKey(key, tags);

      await this.redis.set(cacheKey, value, {
        ex: ttl
      });

      // Store key in tag sets for invalidation
      for (const tag of tags) {
        await this.redis.sadd(`tag:${tag}`, cacheKey);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      throw new AppError('Failed to cache data', 500, 'CACHE_ERROR', error);
    }
  }

  async delete(key: string, tags?: string[]): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, tags);
      await this.redis.del(cacheKey);

      // Remove key from tag sets
      if (tags?.length) {
        for (const tag of tags) {
          await this.redis.srem(`tag:${tag}`, cacheKey);
        }
      }
    } catch (error) {
      console.error('Cache delete error:', error);
      throw new AppError('Failed to delete cached data', 500, 'CACHE_ERROR', error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        if (keys.length) {
          await this.redis.del(...keys);
          await this.redis.del(`tag:${tag}`);
        }
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
      throw new AppError('Failed to invalidate cache', 500, 'CACHE_ERROR', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
      throw new AppError('Failed to clear cache', 500, 'CACHE_ERROR', error);
    }
  }
}

export const cache = Cache.getInstance(); 