import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Product Management API',
    version: '1.0.0',
    description: 'A comprehensive RESTful API for managing products with features including authentication, role-based access control, caching, pagination, filtering, and statistics.',
    contact: {
      name: 'API Support',
      url: 'https://github.com/ahmedhesein1/Product-Management-API',
    },
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Products',
      description: 'Product management endpoints',
    },
    {
      name: 'Statistics',
      description: 'Product statistics and analytics (Admin only)',
    },
  ],
  components: {
    securitySchemes: {
      UserRoleAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-User-Role',
        description: 'User role for authentication. Valid values: "admin" or "user"',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique product identifier',
            example: '507f1f77bcf86cd799439011',
          },
          sku: {
            type: 'string',
            description: 'Stock Keeping Unit (unique, immutable)',
            minLength: 3,
            maxLength: 50,
            pattern: '^[A-Za-z0-9\\-_]+$',
            example: 'PROD-001',
          },
          name: {
            type: 'string',
            description: 'Product name',
            minLength: 3,
            maxLength: 200,
            example: 'Wireless Bluetooth Headphones',
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Product description',
            maxLength: 1000,
            example: 'High-quality wireless headphones with noise cancellation',
          },
          category: {
            type: 'string',
            description: 'Product category',
            minLength: 2,
            maxLength: 100,
            example: 'Electronics',
          },
          type: {
            type: 'string',
            enum: ['public', 'private'],
            description: 'Product visibility type. Public products are visible to all users, private products only to admins',
            example: 'public',
          },
          price: {
            type: 'number',
            format: 'float',
            minimum: 0.01,
            description: 'Product price (max 2 decimal places)',
            example: 99.99,
          },
          discountPrice: {
            type: 'number',
            format: 'float',
            nullable: true,
            minimum: 0,
            description: 'Discounted price (must be less than regular price, max 2 decimal places)',
            example: 79.99,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
            description: 'Available quantity in stock',
            example: 50,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Product creation timestamp',
            example: '2024-01-15T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Product last update timestamp',
            example: '2024-01-20T14:45:00.000Z',
          },
        },
        required: ['id', 'sku', 'name', 'category', 'type', 'price', 'quantity', 'createdAt', 'updatedAt'],
      },
      CreateProductInput: {
        type: 'object',
        properties: {
          sku: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            pattern: '^[A-Za-z0-9\\-_]+$',
            example: 'PROD-001',
          },
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Wireless Bluetooth Headphones',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 1000,
            example: 'High-quality wireless headphones with noise cancellation',
          },
          category: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Electronics',
          },
          type: {
            type: 'string',
            enum: ['public', 'private'],
            example: 'public',
          },
          price: {
            type: 'number',
            format: 'float',
            minimum: 0.01,
            example: 99.99,
          },
          discountPrice: {
            type: 'number',
            format: 'float',
            nullable: true,
            minimum: 0,
            example: 79.99,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
            example: 50,
          },
        },
        required: ['sku', 'name', 'category', 'type', 'price', 'quantity'],
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Updated Product Name',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 1000,
            example: 'Updated description',
          },
          category: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Electronics',
          },
          type: {
            type: 'string',
            enum: ['public', 'private'],
            example: 'public',
          },
          price: {
            type: 'number',
            format: 'float',
            minimum: 0.01,
            example: 89.99,
          },
          discountPrice: {
            type: 'number',
            format: 'float',
            nullable: true,
            minimum: 0,
            example: 69.99,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
            example: 100,
          },
        },
      },
      ProductStats: {
        type: 'object',
        properties: {
          totalProducts: {
            type: 'integer',
            description: 'Total number of products',
            example: 150,
          },
          totalInventoryValue: {
            type: 'number',
            format: 'float',
            description: 'Total value of all inventory (price × quantity)',
            example: 45678.50,
          },
          totalDiscountedValue: {
            type: 'number',
            format: 'float',
            description: 'Total value if all discounted products sold at discount price',
            example: 38900.25,
          },
          averagePrice: {
            type: 'number',
            format: 'float',
            description: 'Average price across all products',
            example: 304.52,
          },
          outOfStockCount: {
            type: 'integer',
            description: 'Number of products with zero quantity',
            example: 12,
          },
          productsByCategory: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  example: 'Electronics',
                },
                count: {
                  type: 'integer',
                  example: 45,
                },
                totalValue: {
                  type: 'number',
                  format: 'float',
                  example: 15678.90,
                },
              },
            },
          },
          productsByType: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['public', 'private'],
                  example: 'public',
                },
                count: {
                  type: 'integer',
                  example: 120,
                },
                totalValue: {
                  type: 'number',
                  format: 'float',
                  example: 38900.50,
                },
              },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'integer',
            example: 1,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          totalItems: {
            type: 'integer',
            example: 95,
          },
          itemsPerPage: {
            type: 'integer',
            example: 10,
          },
          hasNextPage: {
            type: 'boolean',
            example: true,
          },
          hasPreviousPage: {
            type: 'boolean',
            example: false,
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'An error occurred',
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              details: {
                oneOf: [
                  { type: 'string' },
                  { type: 'object' },
                  { type: 'array' },
                ],
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Check if the API is running and healthy',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    service: {
                      type: 'string',
                      example: 'Product Management API',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-15T10:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get all products',
        description: 'Retrieve a paginated list of products with optional filtering and sorting. Regular users can only see public products, admins can see all products.',
        security: [{ UserRoleAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number (minimum: 1)',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page (minimum: 1, maximum: 100)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category',
            schema: {
              type: 'string',
              example: 'Electronics',
            },
          },
          {
            name: 'type',
            in: 'query',
            description: 'Filter by product type (admin only, ignored for regular users)',
            schema: {
              type: 'string',
              enum: ['public', 'private'],
            },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search in product name and description',
            schema: {
              type: 'string',
              example: 'wireless',
            },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sort field',
            schema: {
              type: 'string',
              enum: ['name', 'price', 'quantity', 'createdAt'],
              default: 'createdAt',
            },
          },
          {
            name: 'order',
            in: 'query',
            description: 'Sort order',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'asc',
            },
          },
          {
            name: 'minPrice',
            in: 'query',
            description: 'Minimum price filter',
            schema: {
              type: 'number',
              format: 'float',
              example: 10.00,
            },
          },
          {
            name: 'maxPrice',
            in: 'query',
            description: 'Maximum price filter',
            schema: {
              type: 'number',
              format: 'float',
              example: 500.00,
            },
          },
        ],
        responses: {
          200: {
            description: 'Products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Products retrieved successfully',
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product',
                      },
                    },
                    pagination: {
                      $ref: '#/components/schemas/Pagination',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Missing or invalid authentication',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'Create a new product (Admin only). SKU must be unique.',
        security: [{ UserRoleAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateProductInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Product created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Product created successfully',
                    },
                    data: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                examples: {
                  validationError: {
                    summary: 'Validation error',
                    value: {
                      success: false,
                      message: 'Validation failed',
                      error: {
                        code: 'VALIDATION_ERROR',
                        details: [
                          {
                            field: 'sku',
                            message: 'SKU is required',
                          },
                        ],
                      },
                    },
                  },
                  duplicateSKU: {
                    summary: 'Duplicate SKU',
                    value: {
                      success: false,
                      message: 'Product with this SKU already exists',
                      error: {
                        code: 'DUPLICATE_SKU',
                        details: 'SKU must be unique',
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/products/stats': {
      get: {
        tags: ['Statistics'],
        summary: 'Get product statistics',
        description: 'Retrieve comprehensive statistics about all products (Admin only)',
        security: [{ UserRoleAuth: [] }],
        responses: {
          200: {
            description: 'Statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Statistics retrieved successfully',
                    },
                    data: {
                      $ref: '#/components/schemas/ProductStats',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        description: 'Retrieve a single product by its ID. Regular users can only access public products.',
        security: [{ UserRoleAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
          },
        ],
        responses: {
          200: {
            description: 'Product retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Product retrieved successfully',
                    },
                    data: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  success: false,
                  message: 'Product not found',
                  error: {
                    code: 'NOT_FOUND',
                    details: {
                      resource: 'Product',
                      id: '507f1f77bcf86cd799439011',
                    },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        description: 'Update an existing product by ID (Admin only). All fields are optional.',
        security: [{ UserRoleAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProductInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Product updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Product updated successfully',
                    },
                    data: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        description: 'Delete a product by ID (Admin only)',
        security: [{ UserRoleAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID',
            schema: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
          },
        ],
        responses: {
          204: {
            description: 'Product deleted successfully (no content)',
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - Admin access required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};
