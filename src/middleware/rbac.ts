import { Request, Response, NextFunction } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
      error: {
        code: "FORBIDDEN",
        details: "Admin role required for this operation",
      },
    });
  }

  return next();
};