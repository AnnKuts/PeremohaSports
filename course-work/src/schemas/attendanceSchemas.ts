import { z } from "zod";
import { positiveNumberString, positiveNumber } from "./common";

export const getAttendanceByIdSchema = z.object({
  query: z.object({
    session_id: positiveNumberString,
    client_id: positiveNumberString,
  }),
});

export const getAttendancesBySessionIdSchema = z.object({
  params: z.object({
    session_id: positiveNumberString,
  }),
});

export const createAttendanceSchema = z.object({
  body: z.object({
    session_id: positiveNumber,
    client_id: positiveNumber,
  }),
});

export const updateAttendanceStatusSchema = z.object({
  body: z.object({
    session_id: positiveNumber,
    client_id: positiveNumber,
    status: z.enum(["booked", "attended", "missed", "cancelled"], {
      message: "Status must be one of: booked, attended, missed, cancelled",
    }),
  }),
});

export const deleteAttendanceSchema = z.object({
  query: z.object({
    session_id: positiveNumberString,
    client_id: positiveNumberString,
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});