import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        (req as any).validated = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({
            message: "Validation failed",
            errors: err.issues,
          });
        }
        console.error("Validation middleware error", err);
        return res.status(500).json({ message: "Internal validation error" });
      }
    };