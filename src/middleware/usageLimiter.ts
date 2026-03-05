import { Request, Response, NextFunction } from "express";
import { FREE_PLAN_DAILY_LIMIT } from "../helpers/tokenCounter";

export const usageLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  const limit = FREE_PLAN_DAILY_LIMIT;

  if (user?.usage?.dailyMessageCount >= limit) {
    const resetAt = new Date();
    resetAt.setDate(resetAt.getDate() + 1);
    resetAt.setHours(0, 0, 0, 0);

    res.status(429).json({
      error: true,
      message:
        "You've had a blessed day of conversation. Take time to reflect on what we've discussed. Your messages refresh tomorrow morning.",
      resetAt: resetAt.toISOString(),
      remaining: 0,
    });
    return;
  }
  next();
};
