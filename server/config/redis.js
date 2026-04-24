import { createClient } from 'redis';
import { logInfo, logError } from '../utils/logger.js';

/**
 * Redis Configuration
 * Used for:
 * - Socket.io adapter (cross-server communication)
 * - Rate limiting
 * - Session management
 * - Cache layer
 */

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (process.env.REDIS_REQUIRED !== 'true') {
        return false;
      }

      if (retries > 10) {
        logError('Redis connection failed after 10 attempts');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries * 50, 500);
    },
  },
});

redisClient.on('connect', () => {
  logInfo('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  logError('Redis connection error', err);
});

redisClient.on('reconnecting', () => {
  logInfo('🔄 Redis reconnecting...');
});

let redis = null;
let redisAvailable = false;

try {
  await redisClient.connect();
  redis = redisClient;
  redisAvailable = true;
} catch (error) {
  logError('Redis unavailable, continuing without Redis features', error);
}

export { redis, redisAvailable };

/**
 * Helper function to set cache with TTL
 */
export const setCacheWithTTL = async (key, value, ttl = 300) => {
  if (!redisAvailable || !redis) {
    return;
  }

  try {
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logError('Cache set failed', error, { key });
  }
};

/**
 * Helper function to get from cache
 */
export const getFromCache = async (key) => {
  if (!redisAvailable || !redis) {
    return null;
  }

  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logError('Cache get failed', error, { key });
    return null;
  }
};

/**
 * Helper function to delete from cache
 */
export const deleteFromCache = async (key) => {
  if (!redisAvailable || !redis) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    logError('Cache delete failed', error, { key });
  }
};

export default {
  redis,
  setCacheWithTTL,
  getFromCache,
  deleteFromCache,
};
