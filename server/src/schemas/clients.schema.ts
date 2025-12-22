import { z } from 'zod';

export const getClientsSchema = z.object({
  query: z.object({
    active: z
      .string()
      .optional()
      .refine(
        (val) => val === 'true' || val === 'false' || val === undefined,
        "active must be 'true' or 'false'"
      )
  })
});

export const clientIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Client ID must be a number')
  })
});

export const updateClientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Client ID must be a number')
  }),

  body: z
    .object({
      first_name: z.string().min(1).max(32).optional(),
      last_name: z.string().min(1).max(32).optional(),
      gender: z.enum(['male', 'female']).optional(),
      contact_data: z
        .object({
          email: z.string().email().optional(),
          phone: z.string().max(32).optional()
        })
        .optional()
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      'At least one field must be provided for update'
    )
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>['body'];
