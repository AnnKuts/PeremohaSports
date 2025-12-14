import crypto from "crypto";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../lib/ses";
import { authConfig } from "../config/auth.config";
import { awsConfig } from "../config/aws.config";

export interface ActivationPayload {
  email: string;
  clientId: number;
  expiresAt: number;
  nonce: string;
}

export const emailService = {
  generateActivationCode(email: string, clientId: number) {
    const expiresAt = Date.now() + authConfig.otp.ttlMs;
    const nonce = crypto.randomBytes(8).toString("hex");

    const payload: ActivationPayload = {
      email,
      clientId,
      expiresAt,
      nonce,
    };

    const data = JSON.stringify(payload);

    const signature = crypto
      .createHmac("sha256", authConfig.otp.hmacSecret)
      .update(data)
      .digest("hex");

    const code = Buffer.from(`${data}|${signature}`).toString("base64");

    return { code, expiresAt };
  },

  verifyActivationCode(code: string): ActivationPayload {
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

    const payload: ActivationPayload = JSON.parse(data);

    if (Date.now() > payload.expiresAt) {
      throw new Error("Activation code expired");
    }

    return payload;
  },

  async sendActivationEmail(email: string, code: string) {
    const command = new SendEmailCommand({
      Source: awsConfig.sesFromEmail, // MUST be verified in SES
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Your login code",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `Your one-time login code:\n\n${code}\n\nThis code expires in 15 minutes.`,
            Charset: "UTF-8",
          },
        },
      },
    });

    await sesClient.send(command);
  },
};
