import redisClient, { isRedisConnected, safeGetFromRedis, safeSetToRedis, safeDelFromRedis } from '../config/redisConfig';

/**
 * Set data in Redis cache
 * @param key - Cache key
 * @param value - Data to cache
 * @param expiryInSeconds - TTL in seconds (default 1 hour)
 */
export const setCache = async (key: string, value: any, expiryInSeconds = 3600): Promise<boolean> => {
  try {
    if (!isRedisConnected) {
      console.debug(`Redis not connected, skipping cache set for key ${key}`);
      return false;
    }
    
    return await safeSetToRedis(key, JSON.stringify(value), { EX: expiryInSeconds });
  } catch (error) {
    console.error(`Redis setCache error for key ${key}:`, error);
    return false;
  }
};

/**
 * Get data from Redis cache
 * @param key - Cache key
 * @returns The cached data or null if not found
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!isRedisConnected) {
      console.debug(`Redis not connected, skipping cache get for key ${key}`);
      return null;
    }
    
    const data = await safeGetFromRedis(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error(`Redis getCache error for key ${key}:`, error);
    return null;
  }
};

/**
 * Delete a specific key from Redis cache
 * @param key - Cache key to delete
 */
export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    if (!isRedisConnected) {
      console.debug(`Redis not connected, skipping cache delete for key ${key}`);
      return false;
    }
    
    return await safeDelFromRedis(key);
  } catch (error) {
    console.error(`Redis deleteCache error for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern from Redis cache
 * @param pattern - Pattern to match keys for deletion (e.g., "user:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<boolean> => {
  try {
    if (!isRedisConnected) {
      console.debug(`Redis not connected, skipping cache pattern delete for ${pattern}`);
      return false;
    }
    
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      // Fix: Cast the keys to string or handle each key individually
      await Promise.all(keys.map(key => safeDelFromRedis(key)));
    }
    return true;
  } catch (error) {
    console.error(`Redis deleteCachePattern error for pattern ${pattern}:`, error);
    return false;
  }
};