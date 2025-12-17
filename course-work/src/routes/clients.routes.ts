import {Router} from "express";
import {validate} from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { 
  requireAdmin, 
  requireClientOwnerOrAdmin
} from "../middlewares/authorize";
import {ClientsController} from "../controllers/clients.controller";
import {getClientsSchema, clientIdParamSchema, updateClientSchema} from "../schemas/clients.schema";

const router = Router();

router.get("/", authenticate, requireAdmin, validate(getClientsSchema), ClientsController.getClients);
router.get("/:id", authenticate, requireClientOwnerOrAdmin, validate(clientIdParamSchema), ClientsController.getClientById);
router.get("/:id/memberships",  authenticate, requireClientOwnerOrAdmin, validate(clientIdParamSchema), ClientsController.getClientMemberships);
router.get("/:id/payments", authenticate, requireClientOwnerOrAdmin, validate(clientIdParamSchema), ClientsController.getClientPayments);
router.get("/:id/attendance", authenticate, requireClientOwnerOrAdmin, validate(clientIdParamSchema), ClientsController.getClientAttendance);
router.patch("/:id", authenticate, requireClientOwnerOrAdmin, validate(updateClientSchema), ClientsController.updateClient);

export default router;