import { z } from 'zod';
import AppError from '../utils/AppError';

export const activationEmailPayloadSchema = z.object({
  email: z.string().email(),
  actor: z.enum(['client', 'trainer']),
  actorId: z.number(),
  expiresAt: z.number().int(),
  nonce: z.string().min(8)
});

export type ActivationEmailPayload = z.infer<typeof activationEmailPayloadSchema>;

export function parseActivationEmailPayload(data: unknown): ActivationEmailPayload {
  const parsed = activationEmailPayloadSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError('Invalid activation email payload', 400);
  }

  if (Date.now() > parsed.data.expiresAt) {
    throw new AppError('Activation code expired', 400);
  }

  return parsed.data;
}
