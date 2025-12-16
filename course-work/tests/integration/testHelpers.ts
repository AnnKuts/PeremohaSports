import jwt from "jsonwebtoken";
import { authConfig } from "../../src/config/auth.config";
export const generateTestToken = (payload: any) => {
  return jwt.sign(payload, authConfig.jwt.secret, { expiresIn: "1h" });
};

export const adminToken = generateTestToken({
  actor: "trainer",
  trainerId: 1,
  email: "admin@test.com",
  isAdmin: true,
});

export const createTrainerToken = (id: number, email: string) => {
  return generateTestToken({
    actor: "trainer",
    trainerId: id,
    email: email,
    isAdmin: false,
  });
};

export const clientToken = generateTestToken({
  actor: "client",
  clientId: 1,
  email: "client@test.com",
});