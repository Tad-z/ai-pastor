import { Request, Response, NextFunction } from "express";
import { admin } from "../config/firebase";
import { getUserByFirebaseUid } from "../dao/user.dao";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: true, message: "Missing or invalid authorization token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await getUserByFirebaseUid(decoded.uid);
    if (!user) {
      res.status(401).json({ error: true, message: "User not found. Please register first." });
      return;
    }
    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ error: true, message: "Invalid or expired token" });
  }
};
