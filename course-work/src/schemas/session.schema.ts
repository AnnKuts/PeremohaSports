import { z } from "zod";

export const sessionIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
  }),
});

export const createSessionSchema = z.object({
  body: z.object({
    trainer_id: z.number().int().positive(),
    room_id: z.number().int().positive(),
    class_type_id: z.number().int().positive(),
    date: z.string().transform((str) => new Date(str)),
    duration: z.string(),
    capacity: z.number().int().positive(),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>["body"];