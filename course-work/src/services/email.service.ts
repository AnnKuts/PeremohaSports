import crypto from "crypto";
import { authConfig } from "../config/auth.config";
import {parseActivationEmailPayload, ActivationEmailPayload,} from "../schemas/email.schema";

export const emailService = {
  generateActivationCode(email: string, clientId: number) {
    const payload: ActivationEmailPayload = {
      email,
      clientId,
      expiresAt: Date.now() + authConfig.otp.ttlMs,
      nonce: crypto.randomBytes(8).toString("hex"),
    };

    const data = JSON.stringify(payload);

    const signature = crypto
      .createHmac("sha256", authConfig.otp.hmacSecret)
      .update(data)
      .digest("hex");

    const code = Buffer.from(`${data}|${signature}`).toString("base64");
    return { code, expiresAt: payload.expiresAt };
  },

  verifyActivationCode(code: string) {
    const decoded = Buffer.from(code, "base64").toString("utf-8");
    const [data, signature] = decoded.split("|");

    if (!data || !signature) {
      throw new Error("Invalid activation code format");
    }

    const expectedSignature = crypto
      .createHmac("sha256", authConfig.otp.hmacSecret)
      .update(data)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      throw new Error("Invalid activation code signature");
    }

    return parseActivationEmailPayload(JSON.parse(data));
  },
};
