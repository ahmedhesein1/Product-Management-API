import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'Maximum 100 requests per 15 minutes allowed',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        details: 'Maximum 100 requests per 15 minutes allowed',
      },
    });
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many requests for this endpoint, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'Maximum 30 requests per 15 minutes allowed for this endpoint',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests for this endpoint, please try again later',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        details: 'Maximum 30 requests per 15 minutes allowed for this endpoint',
      },
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: 'Maximum 20 authentication attempts per 15 minutes allowed',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        details: 'Maximum 20 authentication attempts per 15 minutes allowed',
      },
    });
  },
});
