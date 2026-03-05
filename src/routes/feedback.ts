import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireSignedIn } from "../middleware/requireSignedIn";
import { submitFeedback } from "../controller/feedback";

const router = Router();
router.post("/", authMiddleware, requireSignedIn, submitFeedback);
export default router;
