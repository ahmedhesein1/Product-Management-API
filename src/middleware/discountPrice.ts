import { Request, Response, NextFunction } from "express";
import { CreateProductInput, UpdateProductInput } from "../types/product.types";
import { Product } from "../models/product.model";

export const validateDiscountPriceCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { price, discountPrice } = req.body as CreateProductInput;

  if (
    discountPrice !== null &&
    discountPrice !== undefined &&
    discountPrice >= price
  ) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: [
          {
            field: "discountPrice",
            message: "Discount price must be less than the original price",
          },
        ],
      },
    });
  }

  return next();
};

export const validateDiscountPriceUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { price, discountPrice } = req.body as UpdateProductInput;

  if (discountPrice === undefined && price === undefined) {
    return next();
  }

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

  const finalPrice = price !== undefined ? price : product.price;
  const finalDiscountPrice =
    discountPrice !== undefined ? discountPrice : product.discountPrice;

  if (
    finalDiscountPrice !== null &&
    finalDiscountPrice !== undefined &&
    finalDiscountPrice >= finalPrice
  ) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: [
          {
            field: "discountPrice",
            message: "Discount price must be less than the original price",
          },
        ],
      },
    });
  }

  next();
};