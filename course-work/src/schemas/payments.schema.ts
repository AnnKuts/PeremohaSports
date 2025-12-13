import { z } from "zod";

export const paymentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Payment ID must be a number"),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    method: z.enum(["cash", "card", "online"], "Payment method must be cash, card, or online"),
    client_id: z.number().positive("Client ID must be positive"),
    membership_id: z.number().positive("Membership ID must be positive").optional(),
  }),
});

export const updatePaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Payment ID must be a number"),
  }),
  body: z
    .object({
      amount: z.number().positive("Amount must be positive").optional(),
      status: z.enum(["pending", "completed", "failed", "refunded"], "Status must be pending, completed, failed, or refunded").optional(),
      method: z.enum(["cash", "card", "online"], "Payment method must be cash, card, or online").optional(),
      membership_id: z.number().positive("Membership ID must be positive").optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided for update"
    )
    .strict(),
});

export const getPaymentsSchema = z.object({
  query: z.object({
    status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
    method: z.enum(["cash", "card", "online"]).optional(),
    client_id: z.string().regex(/^\d+$/, "Client ID must be a number").optional(),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>["body"];
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>["body"];
export type GetPaymentsQuery = z.infer<typeof getPaymentsSchema>["query"];
