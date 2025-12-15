export const authConfig = {
  otp: {
    ttlMs: Number(process.env.OTP_CODE_TTL_MIN ?? 15) * 60 * 1000,
    hmacSecret: process.env.HMAC_SECRET as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    ttl: (process.env.JWT_TTL ?? "24h") as string,
  },
};

if (!authConfig.jwt.secret) {
  throw new Error("JWT_SECRET is not defined");
}

if (!authConfig.otp.hmacSecret) {
  throw new Error("HMAC_SECRET is not defined");
}
