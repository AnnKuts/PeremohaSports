import { Router } from "express";
import { ClientsController } from "../controllers/clients.controller";

const router = Router();

router.get("/", ClientsController.getClients);
router.get("/:id", ClientsController.getClientById);
router.get("/:id/memberships", ClientsController.getClientMemberships);
router.get("/:id/payments", ClientsController.getClientPayments);
router.get("/:id/attendance", ClientsController.getClientAttendance);
router.patch("/:id", ClientsController.updateClient);

export default router;