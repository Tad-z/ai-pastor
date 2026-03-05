import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { _getProfile, _updateProfile, _updatePreferences, _updateNotifications, _updateDataControls, _getUsage } from "../logic/user";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const result = await _getProfile((req as any).user);
    return responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const { displayName, profilePhoto } = req.body;
  try {
    const result = await _updateProfile(userId, { displayName, profilePhoto });
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const updatePreferences = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  try {
    const result = await _updatePreferences(userId, req.body);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const updateNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  try {
    const result = await _updateNotifications(userId, req.body);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const updateDataControls = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  try {
    const result = await _updateDataControls(userId, req.body);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const result = await _getUsage((req as any).user);
    return responseOk(req, res, result);
  } catch (error) { return responseBad(req, res, error); }
};
