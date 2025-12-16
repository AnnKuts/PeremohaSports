import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user || user.actor !== "trainer" || !user.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Admins only." 
    });
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
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Trainers or Admins only." 
    });
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
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (user.actor === "trainer" && user.isAdmin) {
    return next();
  }

  if (user.actor === "trainer" && user.trainerId === resourceId) {
    return next();
  }

  return res.status(403).json({ 
    success: false, 
    message: "Access denied. You can only manage your own data." 
  });
};

export const requireClientOwnerOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const resourceId = Number(req.params.id);

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (user.actor === "trainer" && user.isAdmin) {
    return next();
  }

  if (user.actor === "client" && user.clientId === resourceId) {
    return next();
  }

  return res.status(403).json({ 
    success: false, 
    message: "Access denied. You can only view/edit your own profile." 
  });
};