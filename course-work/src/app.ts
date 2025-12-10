import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import type MessageResponse from "./interfaces/message-response.js";
import registerRoutes from "./routes/register.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import membershipsRoutes from "./routes/memberships.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";

import api from "./api/index.js";
import * as middlewares from "./middlewares.js";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/register', registerRoutes);
app.use("/clients", clientsRoutes);
app.use("/memberships", membershipsRoutes);
app.use("/payments", paymentsRoutes);

app.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
