import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product.model";
import { ProductDoc } from "../types/product.types";

// Extend Express Request to include product
declare global {
  namespace Express {
    interface Request {
      product?: ProductDoc;
    }
  }
}

export const findProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
      error: {
        code: "NOT_FOUND",
        details: {
          resource: "Product",
          id,
        },
      },
    });
  }

  req.product = product;
  return next();
};
