import { Request, Response, NextFunction } from "express";
import { redisGet, redisSet, redisDelete } from "../config/redis";

export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisGet(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache MISS: ${cacheKey}`);

      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        redisSet(cacheKey, JSON.stringify(body), ttlSeconds).catch((err) =>
          console.error("Cache set error:", err)
        );
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

export const invalidateProductCache = async (): Promise<void> => {
  try {
    const patterns = [
      "cache:/api/products*",
      "cache:/api/products/*",
    ];

    for (const pattern of patterns) {
      await redisDelete(pattern);
    }

    console.log("Product cache invalidated");
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};

export const invalidateProductByIdCache = async (id: string): Promise<void> => {
  try {
    await redisDelete(`cache:/api/products/${id}`);
    console.log(`Cache invalidated for product: ${id}`);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};

export const invalidateCacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateProductCache().catch((err) =>
        console.error("Cache invalidation error:", err)
      );
    }

    return originalJson(body);
  };

  next();
};
