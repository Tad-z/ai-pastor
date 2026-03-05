import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { _submitFeedback } from "../logic/feedback";

export const submitFeedback = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const { content, appVersion, platform } = req.body;
  try {
    const result = await _submitFeedback(userId, { content, appVersion, platform });
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
