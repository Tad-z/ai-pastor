import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { _createCommitment, _getCommitments, _getCommitment, _updateCommitment, _deleteCommitment } from "../logic/commitment";

export const createCommitment = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  try {
    const result = await _createCommitment(userId, req.body);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getCommitments = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const status = req.query.status as string | undefined;
  try {
    const result = await _getCommitments(userId, status);
    return responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getCommitment = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const id = req.params.id as string;
  try {
    const result = await _getCommitment(userId, id);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const updateCommitment = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const id = req.params.id as string;
  try {
    const result = await _updateCommitment(userId, id, req.body);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const deleteCommitment = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const id = req.params.id as string;
  try {
    const result = await _deleteCommitment(userId, id);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
