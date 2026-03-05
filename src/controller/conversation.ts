import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { extractPageOptions } from "../helpers/pagination";
import { _createConversation, _getConversations, _getConversation, _deleteConversation, _deleteAllConversations } from "../logic/conversation";

export const createConversation = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const { topic } = req.body;
  try {
    const result = await _createConversation(userId, topic);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getConversations = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const { page, limit } = extractPageOptions(req);
  const search = req.query.search as string | undefined;
  try {
    const result = await _getConversations(userId, page, limit, search);
    return responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getConversation = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const id = req.params.id as string;
  try {
    const result = await _getConversation(userId, id);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const deleteConversation = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const id = req.params.id as string;
  try {
    const result = await _deleteConversation(userId, id);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const deleteAllConversations = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  try {
    const result = await _deleteAllConversations(userId);
    return responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
