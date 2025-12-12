import express from "express";

import type MessageResponse from "../interfaces/message-response.js";

import attendanceRoutes from "../routes/attendanceRoutes.js";
import classTypesRoutes from "../routes/classTypesRoutes.js";
import gymRoutes from "../routes/gymRoutes.js";
import roomRoutes from "../routes/roomRoutes.js";

const router = express.Router();

router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/gyms", gymRoutes);
router.use("/rooms", roomRoutes);
router.use("/class-types", classTypesRoutes);
router.use("/attendance", attendanceRoutes);

export default router;
