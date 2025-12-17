import { z } from "zod";
import { positiveNumberString, positiveNumber, paginationWithStatsSchema } from "./common";

export const createRoomSchema = z.object({
  body: z.object({
    capacity: z.number().int().min(1, "Capacity must be at least 1").max(200, "Capacity cannot exceed 200"),
    gym_id: positiveNumber,
  }),
});

export const searchRoomsSchema = z.object({
  query: z.object({
    minCapacity: positiveNumberString.optional(),
    maxCapacity: positiveNumberString.optional(),
    gymId: positiveNumberString.optional(),
    limit: positiveNumberString.optional(),
    offset: positiveNumberString.optional(),
  }).optional(),
});

export const getRoomByIdSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getRoomClassTypesSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getRoomSessionsSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const createRoomClassTypeSchema = z.object({
  body: z.object({
    room_id: z.number(),
    class_type_id: z.number(),
  }),
});

export const updateRoomCapacitySchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
  body: z.object({
    capacity: z.number().int().min(1, "Capacity must be at least 1").max(200, "Capacity cannot exceed 200"),
  }),
});

export const deleteRoomSchema = z.object({
  params: z.object({
    id: positiveNumberString,
  }),
});

export const getAllRoomsSchema = paginationWithStatsSchema;
export const getRoomRevenueAndAttendanceSchema = z.object({})