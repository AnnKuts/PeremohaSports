import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { authConfig } from "../config/auth.config";

type ClientJwtPayload = {
  actor: "client";
  clientId: number;
  email: string;
};

type TrainerJwtPayload = {
  actor: "trainer";
  trainerId: number;
  email: string;
  isAdmin: boolean;
};


export const authService = {
  generateAuthToken(
    actorId: number,
    email: string,
    actor: "client" | "trainer" = "client",
    isAdmin: boolean = false
  ) {
    if (actor === "client") {
      return this.generateClientToken(actorId, email);
    } else {
      return this.generateTrainerToken(actorId, email, isAdmin);
    }
  },

  generateClientToken(clientId: number, email: string) {
    const payload: ClientJwtPayload = {
      actor: "client",
      clientId,
      email,
    };

    return jwt.sign(payload, authConfig.jwt.secret as Secret, {
      expiresIn: authConfig.jwt.ttl,
    } as SignOptions);
  },

  generateTrainerToken(
    trainerId: number,
    email: string,
    isAdmin: boolean = false,
  ) {
    const payload: TrainerJwtPayload = {
      actor: "trainer",
      trainerId,
      email,
      isAdmin,
    };

    return jwt.sign(payload, authConfig.jwt.secret as Secret, {
      expiresIn: authConfig.jwt.ttl,
    } as SignOptions);
  },
};
