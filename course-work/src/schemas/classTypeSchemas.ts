import { z } from "zod";
import { positiveNumberString, paginationWithStatsSchema } from "./common";
import { CLASS_TYPE_NAMES, CLASS_TYPE_LEVELS } from "../types/enum_types";
export const getAllClassTypesSchema = paginationWithStatsSchema;
export const createClassTypeSchema = z.object({
  body: z.object({
    name: z.enum(CLASS_TYPE_NAMES, {
      message: `Name must be one of: ${CLASS_TYPE_NAMES.join(", ")}`,
    }),
    description: z.string().max(500, "Description too long").optional(),
    level: z.enum(CLASS_TYPE_LEVELS, {
      message: `Level must be one of: ${CLASS_TYPE_LEVELS.join(", ")}`,
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

export const updateClassTypeSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
  body: z.object({
    name: z.enum(CLASS_TYPE_NAMES).optional(),
    description: z.string().max(500, "Description too long").optional(),
    level: z.enum(CLASS_TYPE_LEVELS).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
    path: ["body"],
  }),
});