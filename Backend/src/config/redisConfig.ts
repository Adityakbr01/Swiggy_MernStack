import Redis from 'ioredis';
import { _config } from './_config';

// Track connection state
let isRedisConnected = false;

// Mock Redis implementation for fallback mode
class MockRedis {
  async get(key: string) { return null; }
  async set(key: string, value: string, ...args: any[]) { return 'OK'; }
  async del(key: string) { return 1; }
  async keys(pattern: string) { return []; }
}

// Check if we should connect to Redis
const shouldConnectRedis = process.env.NODE_ENV !== 'test';

// Initialize Redis client
let redisClient: Redis | MockRedis;

if (shouldConnectRedis) {
  redisClient = new Redis({
    host: "localhost",
    port: 6379,
    password: "",
    retryStrategy: (times) => {
      if (times > 3) {
        console.log('Max Redis retries reached, using in-memory fallback');
        return null;
      }
      return Math.min(times * 100, 1000);
    },
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redisClient.on('error', (err) => {
    if (isRedisConnected) {
      console.error('Redis connection lost:', err.message);
      isRedisConnected = false;
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis server');
    isRedisConnected = true;
  });

  redisClient.on('reconnecting', () => {
    if (!isRedisConnected) {
      console.log('🔄 Attempting to reconnect to Redis...');
    }
  });
} else {
  redisClient = new MockRedis();
  console.log('⚠️ Redis disabled, using in-memory fallback');
}

// Graceful connection handler
export const connectRedis = async () => {
  if (!shouldConnectRedis) return;

  try {
    if (redisClient instanceof Redis) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('❌ Failed to connect to Redis, operating in fallback mode');
  }
};

// Wrapper functions for Redis operations
export const safeGetFromRedis = async (key: string) => {
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
};

export const safeSetToRedis = async (key: string, value: string, options?: { EX?: number }) => {
  try {
    if (redisClient instanceof Redis && options?.EX) {
      await redisClient.set(key, value, 'EX', options.EX);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch {
    return false;
  }
};

export const safeDelFromRedis = async (key: string) => {
  try {
    await redisClient.del(key);
    return true;
  } catch {
    return false;
  }
};

// Export Redis client and connection state
export default redisClient;
export { isRedisConnected };
