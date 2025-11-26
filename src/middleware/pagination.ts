import { Request, Response, NextFunction } from "express";

export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Parse and validate query parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  // Attach pagination data to request
  (req as any).pagination = {
    page,
    limit,
    skip,
  };

  return next();
};
