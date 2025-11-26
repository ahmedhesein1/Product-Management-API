import { Request, Response } from "express";
import { Product } from "../models/product.model";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductResponse,
} from "../types/product.types";

const formatProductResponse = (product: any): ProductResponse => {
  return {
    id: product._id.toString(),
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    type: product.type,
    price: product.price,
    discountPrice: product.discountPrice,
    quantity: product.quantity,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
};

export const createProduct = async (req: Request, res: Response) => {
  const input: CreateProductInput = req.body;

  const product = Product.build({
    sku: input.sku,
    name: input.name,
    description: input.description || null,
    category: input.category,
    type: input.type,
    price: input.price,
    discountPrice: input.discountPrice ?? null,
    quantity: input.quantity,
  });

  await product.save();

  console.log(`Product created: ${product.sku} - ${product.name}`);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: formatProductResponse(product),
  });
};

export const getAllProducts = async (req: Request, res: Response) => {
  const userRole = req.userRole!;

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const {
    category,
    type,
    search,
    sort = "createdAt",
    order = "asc",
    minPrice,
    maxPrice,
  } = req.query;

  const filter: any = {};

  if (userRole === "user") {
    filter.type = "public";
  }

  if (category) {
    filter.category = category;
  }

  if (type && (type === "public" || type === "private")) {
    if (userRole === "admin") {
      filter.type = type;
    }
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      filter.price.$gte = parseFloat(minPrice as string);
    }
    if (maxPrice !== undefined) {
      filter.price.$lte = parseFloat(maxPrice as string);
    }
  }

  // Build sort
  const sortOrder = order === "desc" ? -1 : 1;
  const sortField = ["name", "price", "quantity", "createdAt"].includes(sort as string)
    ? (sort as string)
    : "createdAt";
  const sortObj: any = { [sortField]: sortOrder };

  const [products, totalItems] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  console.log(`Products retrieved: ${products.length} items (page ${page}/${totalPages})`);

  res.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    data: products.map(formatProductResponse),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};

export const getProductById = async (req: Request, res: Response) => {
  const userRole = req.userRole!;
  const product = req.product!;

  if (userRole === "user" && product.type === "private") {
    return res.status(404).json({
      success: false,
      message: "Product not found",
      error: {
        code: "NOT_FOUND",
        details: {
          resource: "Product",
          id: req.params.id,
        },
      },
    });
  }

  console.log(`Product retrieved: ${product.sku} - ${product.name}`);

  res.status(200).json({
    success: true,
    message: "Product retrieved successfully",
    data: formatProductResponse(product),
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const input: UpdateProductInput = req.body;
  const product = req.product!;

  if (input.name !== undefined) product.name = input.name;
  if (input.description !== undefined) {
    product.description = input.description || null;
  }
  if (input.category !== undefined) product.category = input.category;
  if (input.type !== undefined) product.type = input.type;
  if (input.price !== undefined) product.price = input.price;
  if (input.discountPrice !== undefined) {
    product.discountPrice = input.discountPrice ?? null;
  }
  if (input.quantity !== undefined) product.quantity = input.quantity;

  await product.save();

  console.log(`Product updated: ${product.sku} - ${product.name}`);

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: formatProductResponse(product),
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = req.product!;

  await product.deleteOne();

  console.log(`Product deleted: ${product.sku} - ${product.name}`);

  res.status(204).send();
};

export const getProductStats = async (req: Request, res: Response) => {
  const products = await Product.find({});

  const totalProducts = products.length;

  let totalInventoryValue = 0;
  let totalDiscountedValue = 0;
  let outOfStockCount = 0;
  const categoryMap = new Map<string, { count: number; totalValue: number }>();
  const typeMap = new Map<"public" | "private", { count: number; totalValue: number }>();

  products.forEach((product) => {
    const inventoryValue = product.price * product.quantity;
    totalInventoryValue += inventoryValue;

    if (product.discountPrice !== null) {
      totalDiscountedValue += product.discountPrice * product.quantity;
    }

    if (product.quantity === 0) {
      outOfStockCount++;
    }

    const categoryStats = categoryMap.get(product.category) || { count: 0, totalValue: 0 };
    categoryStats.count++;
    categoryStats.totalValue += inventoryValue;
    categoryMap.set(product.category, categoryStats);

    const typeStats = typeMap.get(product.type) || { count: 0, totalValue: 0 };
    typeStats.count++;
    typeStats.totalValue += inventoryValue;
    typeMap.set(product.type, typeStats);
  });

  const averagePrice = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

  const productsByCategory = Array.from(categoryMap.entries()).map(
    ([category, stats]) => ({
      category,
      count: stats.count,
      totalValue: parseFloat(stats.totalValue.toFixed(2)),
    })
  );

  const productsByType = Array.from(typeMap.entries()).map(([type, stats]) => ({
    type,
    count: stats.count,
    totalValue: parseFloat(stats.totalValue.toFixed(2)),
  }));

  console.log(`Statistics retrieved: ${totalProducts} total products`);

  res.status(200).json({
    success: true,
    message: "Statistics retrieved successfully",
    data: {
      totalProducts,
      totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
      totalDiscountedValue: parseFloat(totalDiscountedValue.toFixed(2)),
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      outOfStockCount,
      productsByCategory,
      productsByType,
    },
  });
};