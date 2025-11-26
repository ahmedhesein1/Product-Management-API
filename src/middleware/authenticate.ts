import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userRole?: "admin" | "user";
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const role = req.headers["x-user-role"] as string;

  if (!role) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error: {
        code: "UNAUTHORIZED",
        details: "X-User-Role header is missing or invalid",
      },
    });
  }

  const normalizedRole = role.toLowerCase();

  if (normalizedRole !== "admin" && normalizedRole !== "user") {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error: {
        code: "UNAUTHORIZED",
        details: "X-User-Role header is missing or invalid",
      },
    });
  }

  (req as any).userRole = normalizedRole;
  return next();
};