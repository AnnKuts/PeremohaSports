import { Router } from "express";
import { SessionsController } from "../controllers/session.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate"; 
import { requireTrainerRole, requireAdmin } from "../middlewares/authorize";
import { sessionIdParamSchema, createSessionSchema } from "../schemas/session.schema";

const router = Router();

router.get("/sessions", authenticate, SessionsController.getAllSessions);
router.get("/sessions/:id", authenticate, validate(sessionIdParamSchema), SessionsController.getSessionById);

router.post("/sessions", authenticate, requireTrainerRole, validate(createSessionSchema),SessionsController.createSession);

router.delete("/admin/sessions/:id", authenticate, requireAdmin,validate(sessionIdParamSchema), SessionsController.deleteSession);

export default router;