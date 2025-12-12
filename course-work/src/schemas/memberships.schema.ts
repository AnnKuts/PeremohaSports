import { z } from "zod";

export const membershipIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Membership ID must be a number"),
  }),
});

export const createMembershipSchema = z.object({
  body: z.object({
    start_date: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: "Start date must be a valid date",
    }),
    end_date: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: "End date must be a valid date",
    }),
    price: z.number().positive("Price must be a positive number"),
    client_id: z.number().int().positive("Client ID is required"),
    class_type_id: z.number().int().positive("Class Type ID is required"),
    is_disposable: z.boolean().optional().default(false),
  })
    .refine((data) => data.end_date > data.start_date, {
      message: "End date must be after start date",
      path: ["end_date"],
    }),
});

export const updateMembershipSchema = z.object({
  body: z.object({
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    price: z.number().positive().optional(),
    status: z.enum(["active", "expired", "frozen", "cancelled"]).optional(),
    is_disposable: z.boolean().optional(),
  }),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>["body"];
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>["body"];