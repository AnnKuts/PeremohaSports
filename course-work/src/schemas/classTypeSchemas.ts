import { z } from "zod";
import { positiveNumberString, paginationWithStatsSchema } from "./common";

export const createClassTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    description: z.string().max(500, "Description too long").optional(),
    level: z.enum(["beginner", "intermediate", "advanced"], {
      message: "Level must be one of: beginner, intermediate, advanced",
    }),
  }),
});

export const getClassTypeByIdSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getClassTypeTrainersSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getAllClassTypesSchema = paginationWithStatsSchema;