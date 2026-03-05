import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getTopics } from "../controller/topic";

const router = Router();
router.get("/", authMiddleware, getTopics);
export default router;
