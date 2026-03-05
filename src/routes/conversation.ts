import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";
import { usageLimiter } from "../middleware/usageLimiter";
import { uploadChatMedia as uploadChatMediaMiddleware } from "../middleware/upload";
import { createConversation, getConversations, getConversation, deleteConversation, deleteAllConversations } from "../controller/conversation";
import { sendMessage, getMessages } from "../controller/message";
import { uploadChatMedia } from "../controller/media";

const router = Router();
router.post("/", authMiddleware, rateLimiter, createConversation);
router.get("/", authMiddleware, getConversations);
router.get("/:id", authMiddleware, getConversation);
router.delete("/:id", authMiddleware, deleteConversation);
router.delete("/", authMiddleware, deleteAllConversations);

// Messages nested under conversations
router.post("/:id/messages", authMiddleware, rateLimiter, usageLimiter, sendMessage);
router.get("/:id/messages", authMiddleware, getMessages);

// Media upload for chat
router.post("/:id/media", authMiddleware, uploadChatMediaMiddleware, uploadChatMedia);
export default router;
