import { Request, Response, NextFunction } from "express";

export const requireSignedIn = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (user?.isAnonymous) {
    res.status(403).json({ error: true, message: "Please sign in to use this feature" });
    return;
  }
  next();
};
