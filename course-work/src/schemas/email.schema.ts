import { z } from "zod";

export const activationEmailPayloadSchema = z.object({
  email: z.string().email(),
  clientId: z.number().int().positive(),
  expiresAt: z.number().int(),
  nonce: z.string().min(8),
});

export type ActivationEmailPayload = z.infer<
  typeof activationEmailPayloadSchema
>;

export function parseActivationEmailPayload(
  data: unknown
): ActivationEmailPayload {
  const parsed = activationEmailPayloadSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Invalid activation email payload");
  }

  if (Date.now() > parsed.data.expiresAt) {
    throw new Error("Activation code expired");
  }

  return parsed.data;
}
