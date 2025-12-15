import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth.config";

export type ClientJwtPayload = {
  actor: "client";
  clientId: number;
  email: string;
};

export type TrainerJwtPayload = {
  actor: "trainer";
  trainerId: number;
  email: string;
  isAdmin: boolean;
};

export type JwtPayload = ClientJwtPayload | TrainerJwtPayload;

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid token.",
    });
  }

  const token = authHeader.slice(7);

  try {
    req.user = jwt.verify(
      token,
      authConfig.jwt.secret
    ) as JwtPayload;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
