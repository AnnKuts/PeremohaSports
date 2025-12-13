import { Request, Response } from "express";
import { paymentsService } from "../services/payments.service";
import { GetPaymentsQuery, CreatePaymentInput, UpdatePaymentInput } from "../schemas/payments.schema";

export const PaymentsController = {
  getPayments: async (req: Request, res: Response) => {
    try {
      const query = (req as any).validated?.query as GetPaymentsQuery;
      const payments = await paymentsService.getPayments(query);
      res.status(200).json(payments);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  getPaymentById: async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).validated?.params;
      const paymentId = parseInt(id);
      const payment = await paymentsService.getPaymentById(paymentId);
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

  createPayment: async (req: Request, res: Response) => {
    try {
      const data = (req as any).validated?.body as CreatePaymentInput;
      const payment = await paymentsService.createPayment(data);
      res.status(201).json(payment);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes("Foreign key constraint")) {
        res.status(400).json({ error: "Invalid client ID or membership ID" });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  },

  updatePayment: async (req: Request, res: Response) => {
    try {
      const { id } = (req as any).validated?.params;
      const data = (req as any).validated?.body as UpdatePaymentInput;
      const paymentId = parseInt(id);
      const payment = await paymentsService.updatePayment(paymentId, data);
      res.status(200).json(payment);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Payment not found") {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes("Foreign key constraint")) {
        res.status(400).json({ error: "Invalid membership ID" });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  },
  //
  // deletePayment: async (req: Request, res: Response) => {
  //   try {
  //     const { id } = (req as any).validated?.params;
  //     const paymentId = parseInt(id);
  //     await paymentsService.deletePayment(paymentId);
  //     res.status(204).send();
  //   } catch (err: unknown) {
  //     const error = err as Error;
  //     if (error.message === "Payment not found") {
  //       res.status(404).json({ error: error.message });
  //     } else {
  //       res.status(500).json({ error: error.message || "Internal server error" });
  //     }
  //   }
  // },
};
