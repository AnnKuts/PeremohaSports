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
        next(err);
      }
    };
