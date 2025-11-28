import { Request, Response, NextFunction } from 'express';
import { redisGet, redisSet, redisDeletePattern, redisClient } from '../config/redis';

export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cleanUrl = req.originalUrl;
    const cacheKey = `cache:${cleanUrl}`;

    try {
      const cachedData = await redisGet(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache MISS: ${cacheKey}`);

      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        redisSet(cacheKey, JSON.stringify(body), ttlSeconds).catch((err) => console.error('Cache set error:', err));
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateProductCache = async (req: any): Promise<void> => {
  try {
    const id = req.product?._id;

    await redisDeletePattern('cache:/api/products');
    await redisDeletePattern('cache:/api/products?*');

    if (id) {
      await redisDeletePattern(`cache:/api/products/${id}`);
      await redisDeletePattern(`cache:/api/products/${id}?*`);
    }

    await redisDeletePattern('cache:/api/products/stats*');

    console.log('Product cache invalidated');
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

export const invalidateProductByIdCache = async (id: string) => {
  try {
    await redisDeletePattern(`cache:/api/products/${id}*`);
    console.log(`Cache invalidated for product: ${id}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

export const invalidateCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  const invalidateCache = () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateProductCache(req).catch((err) => console.error('Cache invalidation error:', err));
    }
  };

  res.json = function (body: any) {
    invalidateCache();
    return originalJson(body);
  };

  res.send = function (body: any) {
    invalidateCache();
    return originalSend(body);
  };

  next();
};
