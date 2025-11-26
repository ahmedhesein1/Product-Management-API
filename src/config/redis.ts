import { createClient } from 'redis';
import env from './env';

const redisClient = createClient({
  socket: {
    host: env.redis.host,
    port: env.redis.port,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log(`Redis connected on ${env.redis.host}:${env.redis.port}`);
  } catch (err) {
    console.error('Redis connection error:', err);
    process.exit(1);
  }
}

export async function redisGet(key: string): Promise<string | null> {
  return redisClient.get(key);
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  if (ttlSeconds) {
    await redisClient.set(key, value, { EX: ttlSeconds });
  } else {
    await redisClient.set(key, value);
  }
}

export async function redisDelete(key: string): Promise<void> {
  await redisClient.del(key);
}

export { redisClient };
