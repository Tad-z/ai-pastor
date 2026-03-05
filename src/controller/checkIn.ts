import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { extractPageOptions } from "../helpers/pagination";
import { _submitCheckIn, _getCheckInHistory } from "../logic/checkIn";

export const submitCheckIn = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const commitmentId = req.params.id as string;
  const { status, note, mood } = req.body;
  try {
    const result = await _submitCheckIn(userId, commitmentId, { status, note, mood });
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getCheckInHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const commitmentId = req.params.id as string;
  const { page, limit } = extractPageOptions(req);
  try {
    const result = await _getCheckInHistory(userId, commitmentId, page, limit);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
