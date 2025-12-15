import express from "express";

  import type MessageResponse from "../interfaces/message-response.js";

  import attendanceRoutes from "../routes/attendanceRoutes.js";
  import classTypesRoutes from "../routes/classTypesRoutes.js";
  import gymRoutes from "../routes/gymRoutes.js";
  import roomRoutes from "../routes/roomRoutes.js";
  import trainerRoutes from "../routes/trainerRoutes.js";
  import sessionRoutes from "../routes/sessionRoutes.js";
  import registerRoutes from "../routes/register.routes.js";
  import clientsRoutes from "../routes/clients.routes.js";
  import membershipsRoutes from "../routes/memberships.routes.js";
  import paymentsRoutes from "../routes/payments.routes.js";
  import authRoutes from "../routes/auth.routes.js";
  import app from "../app";

  const router = express.Router();

  router.get<object, MessageResponse>("/", (req, res) => {
    res.json({
      message: "API - 👋🌎🌍🌏",
    });
  });

  router.use("/", trainerRoutes);
  router.use("/", sessionRoutes);
  router.use("/gyms", gymRoutes);
  router.use("/rooms", roomRoutes);
  router.use("/class-types", classTypesRoutes);
  router.use("/attendance", attendanceRoutes);
  app.use("/register", registerRoutes);
  app.use("/clients", clientsRoutes);
  app.use("/memberships", membershipsRoutes);
  app.use("/payments", paymentsRoutes);
  app.use("/auth", authRoutes);

  export default router;