import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/authorize';
import {
  paymentIdParamSchema,
  createPaymentSchema,
  updatePaymentSchema,
  getPaymentsSchema,
  revenueByClassTypeSchema
} from '../schemas/payments.schema';

const router = Router();

router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(getPaymentsSchema),
  PaymentsController.getPayments
);
router.get(
  '/analytics/revenue',
  authenticate,
  requireAdmin,
  validate(revenueByClassTypeSchema),
  PaymentsController.getRevenueByClassType
);
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  validate(paymentIdParamSchema),
  PaymentsController.getPaymentById
);
router.post('/', validate(createPaymentSchema), PaymentsController.createPayment);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updatePaymentSchema),
  PaymentsController.updatePayment
);

export default router;
