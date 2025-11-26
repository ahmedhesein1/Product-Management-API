import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import { connectMongo } from "./config/mongoose";
import { redisClient } from "./config/redis";



export async function createApp(): Promise<Application> {
  const app = express();

  await connectMongo();

  await redisClient.connect();
  console.log("Redis connected successfully");

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "Product Management API",
      timestamp: new Date().toISOString(),
    });
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: "error",
      message: `Route ${req.originalUrl} not found`,
    });
  });

  return app;
}
