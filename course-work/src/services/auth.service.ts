import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { authConfig } from "../config/auth.config";

interface JwtPayload {
  clientId: number;
  email: string;
  role: string;
}

export const authService = {
  generateAuthToken(clientId: number, email: string) {
    const payload: JwtPayload = {
      clientId,
      email,
      role: "client",
    };

    return jwt.sign(
      payload,
      authConfig.jwt.secret as Secret,
      {
        expiresIn: authConfig.jwt.ttl,
      } as SignOptions
    );
  },
};
