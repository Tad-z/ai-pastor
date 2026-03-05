import { redis } from "../config/redis";

const DAILY_VERSE_PREFIX = "daily-verse:";
const TOPIC_LIST_KEY = "topics:default";
const TTL_24H = 60 * 60 * 24;
const TTL_1H = 60 * 60;

export const cacheDailyVerse = async (dateStr: string, verse: any): Promise<void> => {
  await redis.setex(`${DAILY_VERSE_PREFIX}${dateStr}`, TTL_24H, JSON.stringify(verse));
};

export const getCachedDailyVerse = async (dateStr: string): Promise<any | null> => {
  const cached = await redis.get(`${DAILY_VERSE_PREFIX}${dateStr}`);
  return cached ? JSON.parse(cached) : null;
};

export const cacheTopics = async (topics: any[]): Promise<void> => {
  await redis.setex(TOPIC_LIST_KEY, TTL_1H, JSON.stringify(topics));
};

export const getCachedTopics = async (): Promise<any[] | null> => {
  const cached = await redis.get(TOPIC_LIST_KEY);
  return cached ? JSON.parse(cached) : null;
};

export const getRateLimitCount = async (key: string): Promise<number> => {
  const val = await redis.get(key);
  return val ? parseInt(val) : 0;
};

export const incrementRateLimit = async (key: string, ttlSeconds: number): Promise<number> => {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, ttlSeconds);
  return count;
};
