import type { Request, Response, NextFunction } from 'express';
import AppError from './AppError';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Global Error Handler]', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }
  if (err.name === 'ZodError' || err.isJoi) {
    return res.status(400).json({
      success: false,
      status: 'error',
      error: 'Validation failed',
      details: err.errors || err.details,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  if (err.code) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        status: 'error',
        error: 'Unique constraint violation',
        details: err.meta,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        status: 'error',
        error: 'Foreign key constraint violation',
        details: err.meta,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        status: 'error',
        error: 'Record not found',
        details: err.meta,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
      });
    }
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    status: 'error',
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
