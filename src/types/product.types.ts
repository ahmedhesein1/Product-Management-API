import { Document } from "mongoose";
// Attributes required to create a product in DB
export interface ProductAttrs {
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  type: "public" | "private";
  price: number;
  discountPrice?: number | null;
  quantity: number;
}

// MongoDB document type
export interface ProductDoc extends Document {
  sku: string;
  name: string;
  description: string | null;
  category: string;
  type: "public" | "private";
  price: number;
  discountPrice: number | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}


export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  type: "public" | "private";
  price: number;
  discountPrice?: number | null;
  quantity: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  category?: string;
  type?: "public" | "private";
  price?: number;
  discountPrice?: number | null;
  quantity?: number;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  type: "public" | "private";
  price: number;
  discountPrice: number | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  type?: "public" | "private";
  search?: string;
  sort?: "name" | "price" | "quantity" | "createdAt";
  order?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductStats {
  totalProducts: number;
  totalInventoryValue: number;
  totalDiscountedValue: number;
  averagePrice: number;
  outOfStockCount: number;
  productsByCategory: {
    category: string;
    count: number;
    totalValue: number;
  }[];
  productsByType: {
    type: "public" | "private";
    count: number;
    totalValue: number;
  }[];
}
