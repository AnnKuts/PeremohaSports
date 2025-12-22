import { Request, Response } from 'express';
import { paymentsService } from '../services/payments.service';
import {
  GetPaymentsQuery,
  CreatePaymentInput,
  UpdatePaymentInput,
  RevenueByClassTypeQuery
} from '../schemas/payments.schema';
import { asyncHandler } from '../utils/async-handler';

export const PaymentsController = {
  getPayments: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validated?.query as GetPaymentsQuery;
    const payments = await paymentsService.getPayments(query);
    res.status(200).json({ success: true, data: payments });
  }),

  getPaymentById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).validated?.params;
    const paymentId = parseInt(id);
    const payment = await paymentsService.getPaymentById(paymentId);
    res.status(200).json({ success: true, data: payment });
  }),

  createPayment: asyncHandler(async (req: Request, res: Response) => {
    const data = (req as any).validated?.body as CreatePaymentInput;
    const payment = await paymentsService.createPayment(data);
    res.status(201).json({ success: true, data: payment });
  }),

  updatePayment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).validated?.params;
    const data = (req as any).validated?.body as UpdatePaymentInput;
    const paymentId = parseInt(id);
    const payment = await paymentsService.updatePayment(paymentId, data);
    res.status(200).json({ success: true, data: payment });
  }),

  getRevenueByClassType: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validated?.query as RevenueByClassTypeQuery;
    const year = query?.year ? parseInt(query.year) : undefined;
    const month = query?.month ? parseInt(query.month) : undefined;

    const revenue = await paymentsService.getRevenueByClassType(year, month);

    res.status(200).json({
      success: true,
      data: revenue,
      filters: {
        year: year || 'all',
        month: month || 'all'
      }
    });
  }),
  deletePayment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = (req as any).validated?.params;
    const paymentId = parseInt(id);
    await paymentsService.deletePayment(paymentId);
    res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  })
};
