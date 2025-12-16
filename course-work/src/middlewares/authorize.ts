import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
import AppError from "../utils/AppError";

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || user.actor !== "trainer" || !user.isAdmin) {
    return next(new AppError("Access denied. Admins only.", 403));
  }

  next();
};

export const requireTrainerRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || user.actor !== "trainer") {
    return next(new AppError("Access denied. Trainers or Admins only.", 403));
  }

  next();
};

export const requireTrainerOwnerOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const resourceId = Number(req.params.id);

  if (!user) {
    return next(new AppError("Not authenticated", 401));
  }

  if (user.actor === "trainer" && user.isAdmin) {
    return next();
  }

  if (user.actor === "trainer" && user.trainerId === resourceId) {
    return next();
  }

  return next(new AppError("Access denied. You can only manage your own data.", 403));
};

export const requireClientOwnerOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const resourceId = Number(req.params.id);

  if (!user) {
    return next(new AppError("Not authenticated", 401));
  }

  if (user.actor === "trainer" && user.isAdmin) {
    return next();
  }

  if (user.actor === "client" && user.clientId === resourceId) {
    return next();
  }

  return next(new AppError("Access denied. You can only view/edit your own profile.", 403));
};