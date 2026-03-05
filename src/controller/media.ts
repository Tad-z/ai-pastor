import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { _uploadProfilePhoto, _uploadChatMedia } from "../logic/media";

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const file = (req as any).file as Express.Multer.File | undefined;
  try {
    if (!file) return responseBad(req, res, new Error("No file provided"));
    const result = await _uploadProfilePhoto(userId, file);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const uploadChatMedia = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const conversationId = req.params.id as string;
  const file = (req as any).file as Express.Multer.File | undefined;
  try {
    if (!file) return responseBad(req, res, new Error("No file provided"));
    const result = await _uploadChatMedia(userId, conversationId, file);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
