import { z } from "zod";
import { positiveNumberString, positiveNumber, paginationWithStatsSchema } from "./common";

export const createGymSchema = z.object({
  body: z.object({
    address: z.string().min(1, "Address is required").max(255, "Address too long"),
    rooms: z.array(z.object({
      capacity: z.number().int().min(1, "Capacity must be at least 1").max(200, "Capacity cannot exceed 200"),
      classTypeIds: z.array(positiveNumber).optional(),
    })).optional(),
    trainers: z.array(z.object({
      first_name: z.string().min(1, "First name is required").max(50, "First name too long"),
      last_name: z.string().min(1, "Last name is required").max(50, "Last name too long"),
      email: z.string().email("Invalid email format").max(100, "Email too long"),
      phone: z.string().min(10, "Phone too short").max(20, "Phone too long"),
      qualifications: z.array(positiveNumber),
    })).optional(),
  }),
});

export const searchGymsByAddressSchema = z.object({
  query: z.object({
    address: z.string().min(1, "Search term is required"),
    limit: positiveNumberString.optional(),
    offset: positiveNumberString.optional(),
  }),
});

export const getGymRoomsSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getGymTrainersSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getAllGymsSchema = paginationWithStatsSchema;

export const getGymByIdSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const deleteGymSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});