import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireSignedIn } from "../middleware/requireSignedIn";
import { createCommitment, getCommitments, getCommitment, updateCommitment, deleteCommitment } from "../controller/commitment";
import { submitCheckIn, getCheckInHistory } from "../controller/checkIn";

const router = Router();
router.post("/", authMiddleware, requireSignedIn, createCommitment);
router.get("/", authMiddleware, requireSignedIn, getCommitments);
router.get("/:id", authMiddleware, requireSignedIn, getCommitment);
router.patch("/:id", authMiddleware, requireSignedIn, updateCommitment);
router.delete("/:id", authMiddleware, requireSignedIn, deleteCommitment);
router.post("/:id/check-in", authMiddleware, requireSignedIn, submitCheckIn);
router.get("/:id/history", authMiddleware, requireSignedIn, getCheckInHistory);
export default router;
