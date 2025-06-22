import { Redis } from '@upstash/redis';
import { AppError } from './error-handling';

// Create Redis instance with fallback for missing env vars
let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (error) {
  console.warn('Redis not configured, using in-memory fallback cache');
}

const DEFAULT_TTL = 60 * 5; // 5 minutes

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

// In-memory fallback cache
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  private tagMap = new Map<string, Set<string>>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async sadd(key: string, value: string): Promise<void> {
    if (!this.tagMap.has(key)) {
      this.tagMap.set(key, new Set());
    }
    this.tagMap.get(key)!.add(value);
  }

  async smembers(key: string): Promise<string[]> {
    return Array.from(this.tagMap.get(key) || []);
  }

  async srem(key: string, value: string): Promise<void> {
    this.tagMap.get(key)?.delete(value);
  }

  async flushdb(): Promise<void> {
    this.cache.clear();
    this.tagMap.clear();
  }
}

export class Cache {
  private static instance: Cache;
  private redis: Redis | MemoryCache;

  private constructor() {
    this.redis = redis || new MemoryCache();
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

      await this.redis.set(cacheKey, value, ttl);

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
          for (const key of keys) {
            await this.redis.del(key);
          }
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