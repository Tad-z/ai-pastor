import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { uploadProfilePhoto } from "../controller/media";

const router = Router();
router.post("/upload", authMiddleware, uploadProfilePhoto);
export default router;
