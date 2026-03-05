import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import conversationRoutes from "./conversation";
import messageRoutes from "./message";
import commitmentRoutes from "./commitment";
import dailyVerseRoutes from "./dailyVerse";
import topicRoutes from "./topic";
import feedbackRoutes from "./feedback";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/commitments", commitmentRoutes);
router.use("/daily-verse", dailyVerseRoutes);
router.use("/topics", topicRoutes);
router.use("/feedback", feedbackRoutes);

export default router;
