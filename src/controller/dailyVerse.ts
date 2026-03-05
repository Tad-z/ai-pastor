import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { _getDailyVerse } from "../logic/dailyVerse";

export const getDailyVerse = async (req: Request, res: Response) => {
  try {
    const result = await _getDailyVerse();
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getDailyVerseByDate = async (req: Request, res: Response) => {
  const date = req.params.date as string;
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return responseBad(req, res, new Error("Invalid date format. Use YYYY-MM-DD."));
    }
    const result = await _getDailyVerse(parsed);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
