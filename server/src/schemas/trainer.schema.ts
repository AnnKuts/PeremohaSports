import { z } from 'zod';

export const trainerIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
  })
});

export const createTrainerSchema = z.object({
  body: z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    is_admin: z.boolean().optional().default(false),
    gym_ids: z.array(z.number().int().positive()).optional(),
    class_type_ids: z.array(z.number().int().positive()).optional()
  })
});

export const updateTrainerSchema = z.object({
  body: z.object({
    first_name: z.string().min(2).optional(),
    last_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    is_deleted: z.boolean().optional(),
    gym_ids: z.array(z.number().int().positive()).optional(),
    class_type_ids: z.array(z.number().int().positive()).optional()
  })
});

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>['body'];
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>['body'];
