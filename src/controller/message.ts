import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { extractPageOptions } from "../helpers/pagination";
import { _sendMessage, _getMessages, _reactToMessage } from "../logic/message";

export const sendMessage = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const conversationId = req.params.id as string;
  const { content, media } = req.body;
  try {
    const result = await _sendMessage(userId, conversationId, content, media);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getMessages = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const conversationId = req.params.id as string;
  const { page, limit } = extractPageOptions(req);
  try {
    const result = await _getMessages(userId, conversationId, page, limit);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const reactToMessage = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const messageId = req.params.id as string;
  try {
    const result = await _reactToMessage(userId, messageId, req.body);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
