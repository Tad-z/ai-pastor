import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getDailyVerse, getDailyVerseByDate } from "../controller/dailyVerse";

const router = Router();
router.get("/", authMiddleware, getDailyVerse);
router.get("/:date", authMiddleware, getDailyVerseByDate);
export default router;
