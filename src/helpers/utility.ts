import { Request, Response as ExpressResponse } from "express";
import { Response } from "../interface";

export const response = (data: { error: boolean; message: string; data?: any }): Response => data;

export const responseOk = (req: Request, res: ExpressResponse, data: any) => {
  return res.status(200).json(data);
};

export const responseBad = (req: Request, res: ExpressResponse, error: any) => {
  return res.status(400).json({
    error: true,
    message: error?.message || "Something went wrong",
  });
};

export const responseUnauthorized = (req: Request, res: ExpressResponse, message = "Unauthorized") => {
  return res.status(401).json({ error: true, message });
};

export const responseForbidden = (req: Request, res: ExpressResponse, message = "Forbidden") => {
  return res.status(403).json({ error: true, message });
};

export const responseNotFound = (req: Request, res: ExpressResponse, message = "Not found") => {
  return res.status(404).json({ error: true, message });
};

export const responseTooMany = (req: Request, res: ExpressResponse, data: any) => {
  return res.status(429).json(data);
};
