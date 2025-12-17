import { Router } from "express";
import { validate } from "../middlewares/validate";
import { ClientsController } from "../controllers/clients.controller";
import { getClientsSchema, clientIdParamSchema, updateClientSchema } from "../schemas/clients.schema";

const router = Router();

router.get("/", validate(getClientsSchema), ClientsController.getClients);
router.get("/:id", validate(clientIdParamSchema), ClientsController.getClientById);
router.get("/:id/memberships", validate(clientIdParamSchema), ClientsController.getClientMemberships);
router.get("/:id/payments", validate(clientIdParamSchema), ClientsController.getClientPayments);
router.get("/:id/attendance", validate(clientIdParamSchema), ClientsController.getClientAttendance);
router.patch("/:id", validate(updateClientSchema), ClientsController.updateClient);
router.delete("/:id", validate(clientIdParamSchema), ClientsController.deleteClient);

export default router;