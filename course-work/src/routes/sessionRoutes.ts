import { Router } from "express";
import { SessionsController } from "../controllers/sessionController";
import { validate } from "../middlewares/validate";
import { sessionIdParamSchema } from "../schemas/sessionSchema";

const router = Router();

router.get("/sessions", SessionsController.getAllSessions);

router.get("/sessions/:id", validate(sessionIdParamSchema), SessionsController.getSessionById);

router.delete("/admin/sessions/:id", validate(sessionIdParamSchema), SessionsController.deleteSession);

export default router;