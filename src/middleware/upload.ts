import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";

const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png"];
const CHAT_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (PROFILE_PHOTO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed for profile photos"));
    }
  },
});

const chatMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (CHAT_MEDIA_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed"));
    }
  },
});

const wrapUpload = (upload: multer.Multer) =>
  (req: Request, res: Response, next: NextFunction): void => {
    upload.single("file")(req, res, (err: any) => {
      if (err instanceof MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
        res.status(400).json({ error: true, message });
        return;
      }
      if (err) {
        res.status(400).json({ error: true, message: err.message });
        return;
      }
      next();
    });
  };

export const uploadProfilePhoto = wrapUpload(profilePhotoUpload);
export const uploadChatMedia = wrapUpload(chatMediaUpload);
