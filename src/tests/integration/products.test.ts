import request from 'supertest';
import { createApp } from '../../app';
import { Application } from 'express';
import {
  createTestProduct,
  createMultipleProducts,
  generateProductData,
  adminHeaders,
  userHeaders,
  extractProductId,
} from '../helpers/testHelpers';

describe('Product Endpoints', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('POST /api/products', () => {
    it('should create a product with admin role', async () => {
      const productData = generateProductData();

      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.data).toMatchObject({
        sku: productData.sku,
        name: productData.name,
        category: productData.category,
        type: productData.type,
        price: productData.price,
        quantity: productData.quantity,
      });
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should reject product creation with user role', async () => {
      const productData = generateProductData();

      const response = await request(app).post('/api/products').set(userHeaders).send(productData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject product creation without authentication', async () => {
      const productData = generateProductData();

      const response = await request(app).post('/api/products').send(productData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate SKU', async () => {
      const productData = generateProductData();

      // Create first product
      await request(app).post('/api/products').set(adminHeaders).send(productData);

      // Try to create duplicate
      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/products').set(adminHeaders).send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate SKU format', async () => {
      const productData = generateProductData({ sku: 'invalid sku!' });

      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate price is positive', async () => {
      const productData = generateProductData({ price: -10 });

      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate discountPrice is less than price', async () => {
      const productData = generateProductData({
        price: 100,
        discountPrice: 150,
      });

      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate quantity is non-negative integer', async () => {
      const productData = generateProductData({ quantity: -5 });

      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should create product without optional fields', async () => {
      const productData = {
        sku: `PROD-${Date.now()}`,
        name: 'Minimal Product',
        category: 'Test',
        type: 'public' as const,
        price: 50,
        quantity: 10,
      };

      const response = await request(app).post('/api/products').set(adminHeaders).send(productData);

      expect(response.status).toBe(201);
      expect(response.body.data.description).toBeNull();
      expect(response.body.data.discountPrice).toBeNull();
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await createMultipleProducts(15, { type: 'public' });
      await createMultipleProducts(5, { type: 'private' });
    });

    it('should get all public products for user', async () => {
      const response = await request(app).get('/api/products').set(userHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(10); // Default limit
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        itemsPerPage: 10,
      });

      // Verify only public products
      response.body.data.forEach((product: any) => {
        expect(product.type).toBe('public');
      });
    });

    it('should get all products for admin', async () => {
      const response = await request(app).get('/api/products').set(adminHeaders).query({ limit: 100 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(20); // 15 public + 5 private
    });

    it('should paginate results', async () => {
      const collections = require('mongoose').connection.collections;
      await collections.products.deleteMany({});

      await createMultipleProducts(15, { type: 'public' });
      await createMultipleProducts(5, { type: 'private' });

      const page1 = await request(app).get('/api/products').set(userHeaders).query({ page: 1, limit: 5 });

      const page2 = await request(app).get('/api/products').set(userHeaders).query({ page: 2, limit: 5 });

      expect(page1.body.data.length).toBe(5);
      expect(page2.body.data.length).toBe(5);
      expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
      expect(page1.body.pagination.hasNextPage).toBe(true);
      expect(page1.body.pagination.hasPreviousPage).toBe(false);
    });

    it('should filter by category', async () => {
      await createTestProduct({ category: 'Books', type: 'public' });

      const response = await request(app).get('/api/products').set(userHeaders).query({ category: 'Books' });

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.category).toBe('Books');
      });
    });

    it('should search by name and description', async () => {
      await createTestProduct({
        name: 'Unique Laptop',
        description: 'Special laptop',
        type: 'public',
      });

      const response = await request(app).get('/api/products').set(userHeaders).query({ search: 'Unique' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by price range', async () => {
      await createTestProduct({ price: 50, type: 'public', discountPrice: null });
      await createTestProduct({ price: 150, type: 'public', discountPrice: null });
      await createTestProduct({ price: 250, type: 'public', discountPrice: null });

      const response = await request(app).get('/api/products').set(userHeaders).query({ minPrice: 100, maxPrice: 200 });

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(200);
      });
    });

    it('should sort by price ascending', async () => {
      // Clear existing products first to ensure clean sort
      const collections = require('mongoose').connection.collections;
      await collections.products.deleteMany({});

      await createTestProduct({ price: 100, type: 'public', discountPrice: null });
      await createTestProduct({ price: 50, type: 'public', discountPrice: null });
      await createTestProduct({ price: 200, type: 'public', discountPrice: null });

      const response = await request(app)
        .get('/api/products')
        .set(userHeaders)
        .query({ sort: 'price', order: 'asc', limit: 100 });

      expect(response.status).toBe(200);
      const prices = response.body.data.map((p: any) => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should sort by price descending', async () => {
      // Clear existing products first
      const collections = require('mongoose').connection.collections;
      await collections.products.deleteMany({});

      await createTestProduct({ price: 100, type: 'public', discountPrice: null });
      await createTestProduct({ price: 50, type: 'public', discountPrice: null });
      await createTestProduct({ price: 200, type: 'public', discountPrice: null });

      const response = await request(app)
        .get('/api/products')
        .set(userHeaders)
        .query({ sort: 'price', order: 'desc', limit: 100 });

      expect(response.status).toBe(200);
      const prices = response.body.data.map((p: any) => p.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get public product for user', async () => {
      const product = await createTestProduct({ type: 'public' });

      const response = await request(app).get(`/api/products/${product._id}`).set(userHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(product._id.toString());
    });

    it('should return 404 for private product accessed by user', async () => {
      const product = await createTestProduct({ type: 'private' });

      const response = await request(app).get(`/api/products/${product._id}`).set(userHeaders);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });

    it('should get private product for admin', async () => {
      const product = await createTestProduct({ type: 'private' });

      const response = await request(app).get(`/api/products/${product._id}`).set(adminHeaders);

      expect(response.status).toBe(200);
      expect(response.body.data.type).toBe('private');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app).get(`/api/products/${fakeId}`).set(adminHeaders);

      expect(response.status).toBe(404);
    });

    it('should return 404 for invalid product ID', async () => {
      const response = await request(app).get('/api/products/invalid-id').set(adminHeaders);

      // Mongoose CastError is handled as 404 in our error handler
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product with admin role', async () => {
      const product = await createTestProduct();

      const updateData = {
        name: 'Updated Product Name',
        price: 199.99,
      };

      const response = await request(app).put(`/api/products/${product._id}`).set(adminHeaders).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should reject update with user role', async () => {
      const product = await createTestProduct();

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set(userHeaders)
        .send({ name: 'New Name' });

      expect(response.status).toBe(403);
    });

    it('should not allow SKU update', async () => {
      const product = await createTestProduct();
      const originalSku = product.sku;

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set(adminHeaders)
        .send({ sku: 'NEW-SKU' });

      // Schema validation forbids additional properties, so this should be 400
      expect(response.status).toBe(400);
    });

    it('should validate updated fields', async () => {
      const product = await createTestProduct();

      const response = await request(app).put(`/api/products/${product._id}`).set(adminHeaders).send({ price: -50 });

      expect(response.status).toBe(400);
    });

    it('should allow partial updates', async () => {
      const product = await createTestProduct({ quantity: 10 });

      const response = await request(app).put(`/api/products/${product._id}`).set(adminHeaders).send({ quantity: 20 });

      expect(response.status).toBe(200);
      expect(response.body.data.quantity).toBe(20);
      expect(response.body.data.name).toBe(product.name);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product with admin role', async () => {
      const product = await createTestProduct();

      const response = await request(app).delete(`/api/products/${product._id}`).set(adminHeaders);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should reject delete with user role', async () => {
      const product = await createTestProduct();

      const response = await request(app).delete(`/api/products/${product._id}`).set(userHeaders);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app).delete(`/api/products/${fakeId}`).set(adminHeaders);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/products/stats', () => {
    beforeEach(async () => {
      // Create test data for statistics
      await createTestProduct({
        category: 'Electronics',
        price: 100,
        quantity: 10,
        type: 'public',
        discountPrice: null,
      });
      await createTestProduct({
        category: 'Electronics',
        price: 200,
        quantity: 5,
        type: 'public',
        discountPrice: null,
      });
      await createTestProduct({ category: 'Books', price: 20, quantity: 50, type: 'public', discountPrice: null });
      await createTestProduct({ category: 'Books', price: 30, quantity: 0, type: 'private', discountPrice: null });
    });

    it('should get statistics with admin role', async () => {
      const response = await request(app).get('/api/products/stats').set(adminHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalProducts');
      expect(response.body.data).toHaveProperty('totalInventoryValue');
      expect(response.body.data).toHaveProperty('totalDiscountedValue');
      expect(response.body.data).toHaveProperty('averagePrice');
      expect(response.body.data).toHaveProperty('outOfStockCount');
      expect(response.body.data).toHaveProperty('productsByCategory');
      expect(response.body.data).toHaveProperty('productsByType');
    });

    it('should calculate correct statistics', async () => {
      const response = await request(app).get('/api/products/stats').set(adminHeaders);

      expect(response.body.data.totalProducts).toBe(4);
      expect(response.body.data.outOfStockCount).toBe(1);
      expect(response.body.data.productsByCategory).toBeInstanceOf(Array);
      expect(response.body.data.productsByType).toBeInstanceOf(Array);
    });

    it('should reject stats request with user role', async () => {
      const response = await request(app).get('/api/products/stats').set(userHeaders);

      expect(response.status).toBe(403);
    });

    it('should reject stats request without authentication', async () => {
      const response = await request(app).get('/api/products/stats');

      expect(response.status).toBe(401);
    });
  });
});
