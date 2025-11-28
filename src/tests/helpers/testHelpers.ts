import { Product } from '../../models/product.model';
import { ProductAttrs } from '../../types/product.types';

export const createTestProduct = async (overrides: Partial<ProductAttrs> = {}) => {
  const defaultProduct: ProductAttrs = {
    sku: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Product',
    description: 'Test product description',
    category: 'Electronics',
    type: 'public',
    price: 99.99,
    discountPrice: 79.99,
    quantity: 10,
    ...overrides,
  };

  const product = Product.build(defaultProduct);
  await product.save();
  return product;
};

export const createMultipleProducts = async (count: number, overrides: Partial<ProductAttrs> = {}) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    const product = await createTestProduct({
      sku: `TEST-${Date.now()}-${i}`,
      name: `Test Product ${i + 1}`,
      ...overrides,
    });
    products.push(product);
  }
  return products;
};

export const generateProductData = (overrides: Partial<ProductAttrs> = {}) => {
  return {
    sku: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Sample Product',
    description: 'Sample product description',
    category: 'Electronics',
    type: 'public' as const,
    price: 149.99,
    discountPrice: 129.99,
    quantity: 50,
    ...overrides,
  };
};

export const adminHeaders = {
  'X-User-Role': 'admin',
  'Content-Type': 'application/json',
};

export const userHeaders = {
  'X-User-Role': 'user',
  'Content-Type': 'application/json',
};

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const extractProductId = (response: any): string => {
  return response.body.data.id;
};
