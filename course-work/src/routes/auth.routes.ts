import {Router} from "express";
import {AuthController} from "../controllers/auth.controller";
import {validate} from "../middlewares/validate";
import {verifyCodeSchema, requestCodeSchema} from "../schemas/auth.schema";
import {authenticate} from "../middlewares/authenticate";

const router = Router();

router.post("/login", validate(requestCodeSchema), AuthController.requestCode);
router.post("/verify-code", validate(verifyCodeSchema), AuthController.verifyCode);
router.post("/request-code", validate(requestCodeSchema), AuthController.requestCode);
router.get("/me", authenticate, AuthController.getMe);

export default router;
