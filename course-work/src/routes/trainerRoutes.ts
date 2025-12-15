import { Router } from "express";
import { TrainersController } from "../controllers/trainerController";
import { validate } from "../middlewares/validate";
import { 
  createTrainerSchema, 
  updateTrainerSchema, 
  trainerIdParamSchema 
} from "../schemas/trainerSchema";

const router = Router();


router.post("/admin/trainers", validate(createTrainerSchema), TrainersController.createTrainer);

router.get("/trainers", TrainersController.getAllTrainers);
router.get("/trainers/:id", validate(trainerIdParamSchema), TrainersController.getTrainerById);
router.get("/trainers/:id/gyms", validate(trainerIdParamSchema), TrainersController.getTrainerGyms);
router.get("/trainers/:id/qualifications", validate(trainerIdParamSchema), TrainersController.getTrainerQualifications);
router.get("/trainers/:id/sessions", validate(trainerIdParamSchema), TrainersController.getTrainerSessions);

router.patch("/admin/trainers/:id", validate(trainerIdParamSchema), validate(updateTrainerSchema), TrainersController.updateTrainer);


export default router;