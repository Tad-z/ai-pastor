import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  username: env.redis.username || undefined,
  password: env.redis.password || undefined,
  lazyConnect: true,
  enableReadyCheck: false,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

export const connectRedis = async (): Promise<void> => {
  await redis.connect();
};
