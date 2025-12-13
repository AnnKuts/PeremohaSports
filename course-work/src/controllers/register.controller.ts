import { Request, Response } from "express";
import { registerService } from "../services/register.service";

export const RegisterController = {
  register: async (req: Request, res: Response) => {
    try {
      const result = await registerService.register(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message.includes("already exists")) {
        res.status(409).json({ error: err.message });
      } else if (err.message.includes("required") || err.message.includes("Invalid")) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message || "Internal server error" });
      }
    }
  }
};