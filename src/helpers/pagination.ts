import { Request } from "express";

export const extractPageOptions = (req: Request) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  return { page, limit };
};

export const queryFilter = (req: Request) => {
  const { page, limit, ...filters } = req.query;
  return filters;
};

export const preparePagingValues = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

export const getPagingResponseDetails = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
