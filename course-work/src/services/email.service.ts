import crypto from "crypto";
import { authConfig } from "../config/auth.config";
import { mailTransporter, nodemailerConfig } from "../config/mail.config";
import { parseActivationEmailPayload, ActivationEmailPayload } from "../schemas/email.schema";

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

  async sendActivationEmail(email: string, code: string) {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isDevelopment) {
      console.log(`Activation code for ${email}: ${code}`);
    }

    const mailOptions = {
      from: nodemailerConfig.from,
      to: email,
      subject: 'Peremoha Sports account activation',
      text: `Your activation code is: ${code}`,
      html: `
        <h2>Account activation</h2>
        <p>Your activation code is: <strong>${code}</strong></p>
        <p>This code will expire in ${authConfig.otp.ttlMs / 60000} minutes.</p>
        <p>Please use this code to activate your account</p>
      `,
    };

    try {
      await mailTransporter.sendMail(mailOptions);
      console.log(`Activation email sent to ${email}`);
    } catch (error) {
      console.error("Failed to send activation email:", error);
      throw new Error("Failed to send activation email");
    }
  },
};

