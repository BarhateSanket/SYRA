import redisClient from '../config/redis.js';

// Cache middleware for API responses
export const cacheMiddleware = (duration = 300) => { // Default 5 minutes
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated routes that might have user-specific data
    if (req.headers.authorization || req.cookies.token) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        console.log(`Cache hit for ${req.originalUrl}`);
        const parsedResponse = JSON.parse(cachedResponse);
        return res.json(parsedResponse);
      }

      // Store original send method
      const originalSend = res.json;

      // Override res.json method to cache the response
      res.json = function(data) {
        // Cache the response
        redisClient.setEx(key, duration, JSON.stringify(data))
          .then(() => console.log(`Cached response for ${req.originalUrl}`))
          .catch(err => console.error('Redis cache error:', err));

        // Call original method
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache for specific patterns
export const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache entries matching ${pattern}`);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// Cache user-specific data with TTL
export const setUserCache = async (userId, key, data, ttl = 3600) => {
  try {
    const cacheKey = `user:${userId}:${key}`;
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Set user cache error:', error);
  }
};

export const getUserCache = async (userId, key) => {
  try {
    const cacheKey = `user:${userId}:${key}`;
    const data = await redisClient.get(cacheKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get user cache error:', error);
    return null;
  }
};

export const clearUserCache = async (userId, key = null) => {
  try {
    const pattern = key ? `user:${userId}:${key}` : `user:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} user cache entries for user ${userId}`);
    }
  } catch (error) {
    console.error('Clear user cache error:', error);
  }
};
