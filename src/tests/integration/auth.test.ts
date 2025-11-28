import request from 'supertest';
import { createApp } from '../../app';
import { Application } from 'express';
import { createTestProduct } from '../helpers/testHelpers';

describe('Authentication and Authorization', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('Authentication Middleware', () => {
    it('should reject requests without X-User-Role header', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with invalid role', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'invalid');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should accept admin role', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'admin');

      expect(response.status).toBe(200);
    });

    it('should accept user role', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'user');

      expect(response.status).toBe(200);
    });

    it('should be case-insensitive for roles', async () => {
      const response1 = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'ADMIN');

      const response2 = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'User');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin to create products', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('X-User-Role', 'admin')
        .send({
          sku: `TEST-${Date.now()}`,
          name: 'Test Product',
          category: 'Test',
          type: 'public',
          price: 100,
          quantity: 10,
        });

      expect(response.status).toBe(201);
    });

    it('should deny user from creating products', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('X-User-Role', 'user')
        .send({
          sku: `TEST-${Date.now()}`,
          name: 'Test Product',
          category: 'Test',
          type: 'public',
          price: 100,
          quantity: 10,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow admin to update products', async () => {
      const product = await createTestProduct();

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set('X-User-Role', 'admin')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
    });

    it('should deny user from updating products', async () => {
      const product = await createTestProduct();

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set('X-User-Role', 'user')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(403);
    });

    it('should allow admin to delete products', async () => {
      const product = await createTestProduct();

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('X-User-Role', 'admin');

      expect(response.status).toBe(204);
    });

    it('should deny user from deleting products', async () => {
      const product = await createTestProduct();

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('X-User-Role', 'user');

      expect(response.status).toBe(403);
    });

    it('should allow admin to access statistics', async () => {
      const response = await request(app)
        .get('/api/products/stats')
        .set('X-User-Role', 'admin');

      expect(response.status).toBe(200);
    });

    it('should deny user from accessing statistics', async () => {
      const response = await request(app)
        .get('/api/products/stats')
        .set('X-User-Role', 'user');

      expect(response.status).toBe(403);
    });

    it('should allow user to view public products', async () => {
      await createTestProduct({ type: 'public' });

      const response = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'user');

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.type).toBe('public');
      });
    });

    it('should hide private products from user in list', async () => {
      await createTestProduct({ type: 'private' });

      const response = await request(app)
        .get('/api/products')
        .set('X-User-Role', 'user')
        .query({ limit: 100 });

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.type).not.toBe('private');
      });
    });

    it('should return 404 when user tries to access private product by ID', async () => {
      const product = await createTestProduct({ type: 'private' });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .set('X-User-Role', 'user');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found');
    });

    it('should allow admin to access private products', async () => {
      const product = await createTestProduct({ type: 'private' });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .set('X-User-Role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body.data.type).toBe('private');
    });
  });
});
