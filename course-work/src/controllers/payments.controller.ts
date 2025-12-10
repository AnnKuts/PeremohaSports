import { Request, Response } from "express";
import { paymentsService } from "../services/payments.service";

export const PaymentsController = {
  getPayments: async (req: Request, res: Response) => {
    try {
      const payments = await paymentsService.getPayments();
      res.status(200).json(payments);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  getPaymentById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid payment ID" });
        return;
      }
      const payment = await paymentsService.getPaymentById(id);
      res.status(200).json(payment);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Payment not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
};