import { Router } from "express";
import { TrainersController } from "../controllers/trainerController";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate"; // Перевірте шлях!
import { 
  requireAdmin, 
  requireTrainerOwnerOrAdmin
} from "../middlewares/authorize";
import { 
  createTrainerSchema, 
  updateTrainerSchema, 
  trainerIdParamSchema 
} from "../schemas/trainerSchema";

const router = Router();

router.get("/analytics/top-trainer", TrainersController.getTopTrainer);
router.get("/analytics/trainers/popular", TrainersController.getPopularTrainers);
router.get("/trainers/:id/workload", validate(trainerIdParamSchema), TrainersController.getTrainerWorkload);

router.post("/admin/trainers", validate(createTrainerSchema), TrainersController.createTrainer);

router.get("/trainers", TrainersController.getAllTrainers);
router.get("/trainers/:id", validate(trainerIdParamSchema), TrainersController.getTrainerById);
router.get("/trainers/:id/gyms", validate(trainerIdParamSchema), TrainersController.getTrainerGyms);
router.get("/trainers/:id/qualifications", validate(trainerIdParamSchema), TrainersController.getTrainerQualifications);
router.get("/trainers/:id/sessions", validate(trainerIdParamSchema), TrainersController.getTrainerSessions);

router.patch("/admin/trainers/:id", validate(trainerIdParamSchema), validate(updateTrainerSchema), TrainersController.updateTrainer);
router.delete("/admin/trainers/:id", validate(trainerIdParamSchema), TrainersController.deleteTrainer);

export default router;