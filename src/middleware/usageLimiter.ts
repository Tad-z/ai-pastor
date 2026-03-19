import { Request, Response, NextFunction } from "express";
import { FREE_PLAN_DAILY_LIMIT } from "../helpers/tokenCounter";
import { updateUser } from "../dao/user.dao";

export const usageLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = (req as any).user;
  const limit = FREE_PLAN_DAILY_LIMIT;

  // Lazy reset — if the cron didn't run (e.g. Render free plan sleep), reset on first message of the day
  const lastReset = user?.usage?.lastResetAt ? new Date(user.usage.lastResetAt) : null;
  const now = new Date();
  const isNewDay =
    !lastReset ||
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate();

  if (isNewDay) {
    await updateUser(user._id.toString(), {
      "usage.dailyMessageCount": 0,
      "usage.dailyTokensUsed": 0,
      "usage.lastResetAt": now,
    });
    user.usage.dailyMessageCount = 0;
  }

  if (user?.usage?.dailyMessageCount >= limit) {
    const resetAt = new Date();
    resetAt.setUTCDate(resetAt.getUTCDate() + 1);
    resetAt.setUTCHours(0, 0, 0, 0);

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
