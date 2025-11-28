import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { connectMongo } from "./config/mongoose";
import { redisClient } from "./config/redis";
import { swaggerDocument } from "./config/swagger";
import productRoutes from "./routes/product.routes";
import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

export async function createApp(): Promise<Application> {
  const app = express();

  await connectMongo();

  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected successfully");
  }

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.use(generalLimiter);

  // Swagger documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Health check
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "Product Management API",
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use("/api/products", productRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: "error",
      message: `Route ${req.originalUrl} not found`,
    });
  });

  app.use(errorHandler);

  return app;
}
