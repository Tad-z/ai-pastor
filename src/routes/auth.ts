import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { ipRateLimiter } from "../middleware/rateLimiter";
import { register, linkAccount, deleteAccount } from "../controller/auth";

const router = Router();
router.post("/register", ipRateLimiter, register);
router.post("/link-account", authMiddleware, linkAccount);
router.delete("/account", authMiddleware, deleteAccount);
export default router;
