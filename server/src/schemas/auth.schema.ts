import { z } from 'zod';

export const verifyCodeSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Code is required')
  })
});

export const requestCodeSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required')
  })
});

export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>['body'];
export type RequestCodeInput = z.infer<typeof requestCodeSchema>['body'];
