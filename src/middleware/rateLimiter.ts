import { Request, Response, NextFunction } from "express";
import { incrementRateLimit } from "../services/cache";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 30;

const REGISTER_WINDOW_SECONDS = 60 * 60; // 1 hour
const REGISTER_MAX_REQUESTS = 10;

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
  const ip = req.ip || req.socket.remoteAddress || "unknown";
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
