import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { reactToMessage } from "../controller/message";

const router = Router();
router.post("/:id/react", authMiddleware, reactToMessage);
export default router;
