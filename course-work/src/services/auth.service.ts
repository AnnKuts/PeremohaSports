import crypto from "crypto";
import jwt from "jsonwebtoken";

const HMAC_SECRET = process.env.HMAC_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const CODE_TTL_MS = 15 * 60 * 1000;
const JWT_TTL = "24h";

if (!HMAC_SECRET) {
  throw new Error("HMAC_SECRET is not defined");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

interface ActivationPayload {
  email: string;
  clientId: number;
  expiresAt: number;
  nonce: string;
}

export const authService = {
  generateActivationCode(email: string, clientId: number) {
    const expiresAt = Date.now() + CODE_TTL_MS;
    const nonce = crypto.randomBytes(8).toString("hex");

    const payload: ActivationPayload = {
      email,
      clientId,
      expiresAt,
      nonce,
    };

    const data = JSON.stringify(payload);

    const signature = crypto
      .createHmac("sha256", HMAC_SECRET)
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
      .createHmac("sha256", HMAC_SECRET)
      .update(data)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new Error("Invalid activation code signature");
    }

    const payload: ActivationPayload = JSON.parse(data);

    if (Date.now() > payload.expiresAt) {
      throw new Error("Activation code expired");
    }

    return payload;
  },

  async sendActivationCode(email: string, code: string) {
    console.log(`
    To: ${email}
    Subject: Your login code
    Your activation code: 
    ${code}
    
    This code expires in 15 minutes.
    `);

    return true;
  },

  generateAuthToken(clientId: number, email: string) {
    return jwt.sign(
      { clientId, email, role: "client" },
      JWT_SECRET,
      { expiresIn: JWT_TTL }
    );
  },
};
