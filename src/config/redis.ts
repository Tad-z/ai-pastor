import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  username: env.redis.username || undefined,
  password: env.redis.password || undefined,
  tls: env.redis.tls ? {} : undefined,
  lazyConnect: true,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  commandTimeout: 5000,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

export const connectRedis = async (): Promise<void> => {
  await redis.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  await redis.quit();
};
