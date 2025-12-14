import type { Request, Response, NextFunction } from "express";
import AppError from "./AppError";

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }
  if (err.name === 'ZodError' || err.isJoi) {
    return res.status(400).json({
      status: 'error',
      error: 'Validation failed',
      details: err.errors || err.details,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    status: 'error',
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
