import express from "express";
import MessageResponse from "../interfaces/message-response";

import gymRoutes from "../routes/gymRoutes"; 

const router = express.Router();

router.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "API - 👋🌎🌍🌏",
  });
});

router.use("/gyms", gymRoutes);

export default router;
