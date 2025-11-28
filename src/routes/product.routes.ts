import express from "express";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/rbac";
import { findProductById } from "../middleware/findProduct";
import { cacheMiddleware, invalidateCacheMiddleware } from "../middleware/cache";
import { validateSchema } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/ajv";
import { strictLimiter } from "../middleware/rateLimiter";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} from "../controllers/product.controller";

const router = express.Router();

// Cache for 5 minutes
router.get("/", authenticate, cacheMiddleware(300), getAllProducts);

// Cache for 1 minute
// Admin only
// Strict rate limit for resource-intensive stats endpoint
router.get("/stats", strictLimiter, authenticate, requireAdmin, cacheMiddleware(60), getProductStats);

// Cache for 10 minutes
router.get("/:id", authenticate, findProductById, cacheMiddleware(600), getProductById);

router.post(
  "/",
  authenticate,
  requireAdmin,
  validateSchema(createProductSchema),
  invalidateCacheMiddleware,
  createProduct
);

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  findProductById,
  validateSchema(updateProductSchema),
  invalidateCacheMiddleware,
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  findProductById,
  invalidateCacheMiddleware,
  deleteProduct
);

export default router;
