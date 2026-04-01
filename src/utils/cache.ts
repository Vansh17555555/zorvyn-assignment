import NodeCache from 'node-cache';
import logger from './logger';

/**
 * Cache utility for dashboard stats and other high-frequency lookups.
 * TTL is in seconds.
 */
class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
    logger.info('Cache service initialized with 5m TTL');
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? 300);
  }

  /**
   * Invalidate the entire cache or a specific pattern.
   * Useful when records are updated.
   */
  invalidate(keyPattern?: string): void {
    if (keyPattern) {
      const keys = this.cache.keys();
      const matchingKeys = keys.filter((key) => key.startsWith(keyPattern));
      matchingKeys.forEach((key) => this.cache.del(key));
      logger.info(`Invalidated cache keys matching: ${keyPattern}`);
    } else {
      this.cache.flushAll();
      logger.info('Flushed entire cache');
    }
  }
}

export const cacheService = new CacheService();
