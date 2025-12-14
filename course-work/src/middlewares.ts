import type { NextFunction, Request, Response } from "express";

import type ErrorResponse from "./interfaces/error-response.js";

import { env } from "./env.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(
  err: any,
  req: any,
  res: any,
  next: any
) {
  console.error("🔥 ERROR:", err);

  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: err.stack, // ← тимчасово
  });
}

