import { Request, Response } from "express";
import { paymentsService } from "../services/payments.service";
import { GetPaymentsQuery, CreatePaymentInput, UpdatePaymentInput } from "../schemas/payments.schema";
import { asyncHandler } from "../utils/async-handler";

export const PaymentsController = {
  getPayments: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validated?.query as GetPaymentsQuery;
    const payments = await paymentsService.getPayments(query);
    res.status(200).json(payments);
  }),

  getPaymentById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).validated?.params;
    const paymentId = parseInt(id);
    const payment = await paymentsService.getPaymentById(paymentId);
    res.status(200).json(payment);
  }),

  createPayment: asyncHandler(async (req: Request, res: Response) => {
    const data = (req as any).validated?.body as CreatePaymentInput;
    const payment = await paymentsService.createPayment(data);
    res.status(201).json(payment);
  }),

  updatePayment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).validated?.params;
    const data = (req as any).validated?.body as UpdatePaymentInput;
    const paymentId = parseInt(id);
    const payment = await paymentsService.updatePayment(paymentId, data);
    res.status(200).json(payment);
  }),
};
