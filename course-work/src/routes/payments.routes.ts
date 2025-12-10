import { Router } from "express";
import { PaymentsController } from "../controllers/payments.controller";

const router = Router();

router.get("/", PaymentsController.getPayments);
router.get("/:id", PaymentsController.getPaymentById);

export default router;