import { Request, Response, NextFunction } from "express";
import { incrementRateLimit } from "../services/cache";
import { env } from "../config/env";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 30;

const REGISTER_WINDOW_SECONDS = 60 * 60; // 1 hour
const REGISTER_MAX_REQUESTS = env.registerRateLimit.max;

// TEMPORARY: mobile dev's IP for the bot/load test (added 2026-11-21).
// Remove this entry once testing is done to restore the limit for that IP.
const LOAD_TEST_IPS = ["2001:4860:7:1633::ef"];

// "::ffff:1.2.3.4" (IPv4-mapped IPv6) → "1.2.3.4", and lowercase so IPv6
// allowlist entries match regardless of case.
const normalizeIp = (ip: string): string => ip.replace(/^::ffff:/i, "").toLowerCase();

const REGISTER_ALLOWLIST = new Set([...LOAD_TEST_IPS, ...env.registerRateLimit.allowlist].map(normalizeIp));

export const rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  if (!user) { next(); return; }

  const key = `rate:${user._id}`;
  const count = await incrementRateLimit(key, WINDOW_SECONDS);

  if (count > MAX_REQUESTS) {
    res.status(429).json({
      error: true,
      message: "Too many requests. Please slow down.",
    });
    return;
  }
  next();
};

export const ipRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ip = normalizeIp(req.ip || req.socket.remoteAddress || "unknown");
  if (REGISTER_ALLOWLIST.has(ip)) { next(); return; }

  const key = `rate:ip:${ip}`;
  const count = await incrementRateLimit(key, REGISTER_WINDOW_SECONDS);

  if (count > REGISTER_MAX_REQUESTS) {
    res.status(429).json({
      error: true,
      message: "Too many registration attempts. Please try again later.",
    });
    return;
  }
  next();
};
