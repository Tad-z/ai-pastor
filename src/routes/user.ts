import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireSignedIn } from "../middleware/requireSignedIn";
import { uploadProfilePhoto as uploadProfilePhotoMiddleware } from "../middleware/upload";
import { getProfile, updateProfile, updatePreferences, updateNotifications, updateDataControls, getUsage } from "../controller/user";
import { uploadProfilePhoto } from "../controller/media";

const router = Router();
router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, updateProfile);
router.patch("/preferences", authMiddleware, updatePreferences);
router.patch("/notifications", authMiddleware, requireSignedIn, updateNotifications);
router.patch("/data-controls", authMiddleware, requireSignedIn, updateDataControls);
router.get("/usage", authMiddleware, getUsage);
router.post("/profile-photo", authMiddleware, uploadProfilePhotoMiddleware, uploadProfilePhoto);
export default router;
