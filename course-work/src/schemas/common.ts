import { z } from "zod";

export const paginationSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

export const paginationWithStatsSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
    includeStats: z.string().transform(val => val === 'true').optional(),
  }).optional(),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a positive number").transform(Number),
  }),
});

export const positiveNumberString = z.string().regex(/^\d+$/, "Must be a positive number").transform(Number);
export const positiveNumber = z.number().int().positive("Must be a positive integer");