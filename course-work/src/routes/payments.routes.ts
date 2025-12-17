import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";
import { validate } from "../middlewares/validate";
import {
  paymentIdParamSchema,
  createPaymentSchema,
  updatePaymentSchema,
  getPaymentsSchema,
  revenueByClassTypeSchema,
} from "../schemas/payments.schema";

const router = Router();

router.get("/", validate(getPaymentsSchema), PaymentsController.getPayments);
router.get("/analytics/revenue", validate(revenueByClassTypeSchema), PaymentsController.getRevenueByClassType);
router.get("/:id", validate(paymentIdParamSchema), PaymentsController.getPaymentById);
router.post("/", validate(createPaymentSchema), PaymentsController.createPayment);
router.patch("/:id", validate(updatePaymentSchema), PaymentsController.updatePayment);
router.delete("/:id", validate(paymentIdParamSchema), PaymentsController.deletePayment);

export default router;