import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import type MessageResponse from "./interfaces/message-response.js";
import registerRoutes from "./routes/register.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import membershipsRoutes from "./routes/memberships.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import authRoutes from "./routes/auth.routes.js";

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
app.use("/auth", authRoutes);

app.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "kto prochital tot loh",
  });
});

app.use("/", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.use((err: any, req: any, res: any, next: any) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    if (message === "Trainer not found" || message === "Session not found") {
        return res.status(404).json({ error: message });
    }
    if (message.includes("exists") || message.includes("invalid")) {
        return res.status(400).json({ error: message });
    }

    res.status(status).json({ error: message });
});

export default app;
