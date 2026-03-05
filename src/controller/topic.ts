import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { _getTopics } from "../logic/topic";

export const getTopics = async (req: Request, res: Response) => {
  try {
    const result = await _getTopics();
    return responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
