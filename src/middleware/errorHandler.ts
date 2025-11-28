import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err.name === "CastError") {
    return res.status(404).json({
      success: false,
      message: "Product not found",
      error: {
        code: "NOT_FOUND",
        details: {
          resource: "Product",
          id: err.value,
        },
      },
    });
  }

  if (err.name === "ValidationError") {
    const errors = err.errors ? Object.values(err.errors).map((error: any) => ({
      field: error.path,
      message: error.message,
    })) : [{ field: "unknown", message: err.message }];

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: errors,
      },
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];

    return res.status(409).json({
      success: false,
      message: `Product with this ${field.toUpperCase()} already exists`,
      error: {
        code: "DUPLICATE_SKU",
        details: {
          field,
          value,
        },
      },
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error: {
      code: "INTERNAL_ERROR",
      details: "Please try again later",
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "NOT_FOUND",
      details: {
        path: req.path,
        method: req.method,
      },
    },
  });
};