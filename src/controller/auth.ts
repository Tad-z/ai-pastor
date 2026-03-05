import { Request, Response } from "express";
import { responseOk, responseBad } from "../helpers/utility";
import { admin } from "../config/firebase";
import { _register, _linkAccount, _deleteAccount } from "../logic/auth";

export const register = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return responseBad(req, res, new Error("Missing authorization token"));
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const result = await _register(decoded.uid, decoded);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) {
    return responseBad(req, res, error);
  }
};

export const linkAccount = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const firebaseUid = (req as any).user.firebaseUid;
  const authHeader = req.headers.authorization;
  try {
    const token = authHeader!.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const result = await _linkAccount(userId, decoded);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) {
    return responseBad(req, res, error);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const userId = (req as any).user._id.toString();
  const firebaseUid = (req as any).user.firebaseUid;
  try {
    const result = await _deleteAccount(userId, firebaseUid);
    return result.error ? responseBad(req, res, new Error(result.message)) : responseOk(req, res, result);
  } catch (error) {
    return responseBad(req, res, error);
  }
};
