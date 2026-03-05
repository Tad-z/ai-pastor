import { cloudinary } from "../config/cloudinary";
import { response } from "../helpers/utility";
import { Response } from "../interface";
import { updateUser } from "../dao/user.dao";
import { getConversationById } from "../dao/conversation.dao";

const uploadBuffer = (
  buffer: Buffer,
  options: object
): Promise<any> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });

export const _uploadProfilePhoto = async (
  userId: string,
  file: Express.Multer.File
): Promise<Response> => {
  // Deterministic public_id per user → Cloudinary overwrites the old photo automatically,
  // no need to fetch and delete the previous URL.
  const result = await uploadBuffer(file.buffer, {
    public_id: `ai-pastor/profile-photos/${userId}`,
    overwrite: true,
    resource_type: "image",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

  await updateUser(userId, { profilePhoto: result.secure_url });

  return response({
    error: false,
    message: "Profile photo updated",
    data: { url: result.secure_url },
  });
};

export const _uploadChatMedia = async (
  userId: string,
  conversationId: string,
  file: Express.Multer.File
): Promise<Response> => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return response({ error: true, message: "Conversation not found" });
  if (conversation.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });

  const isImage = file.mimetype.startsWith("image/");

  const result = await uploadBuffer(file.buffer, {
    folder: "ai-pastor/chat-media",
    resource_type: isImage ? "image" : "raw",
  });

  return response({
    error: false,
    message: "File uploaded",
    data: {
      url: result.secure_url,
      type: isImage ? "image" : "file",
      mimeType: file.mimetype,
      fileName: file.originalname,
    },
  });
};
