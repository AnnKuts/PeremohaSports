import { Router } from 'express';
import { TrainersController } from '../controllers/trainer.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin, requireTrainerOwnerOrAdmin } from '../middlewares/authorize';
import {
  createTrainerSchema,
  updateTrainerSchema,
  trainerIdParamSchema
} from '../schemas/trainer.schema';

const router = Router();

router.get('/analytics/top-trainer', authenticate, TrainersController.getTopTrainer);
router.get('/analytics/trainers/popular', authenticate, TrainersController.getPopularTrainers);
router.get('/trainers', TrainersController.getAllTrainers);
router.get('/trainers/:id', validate(trainerIdParamSchema), TrainersController.getTrainerById);
router.get(
  '/trainers/:id/gyms',
  authenticate,
  validate(trainerIdParamSchema),
  TrainersController.getTrainerGyms
);
router.get(
  '/trainers/:id/qualifications',
  authenticate,
  validate(trainerIdParamSchema),
  TrainersController.getTrainerQualifications
);
router.get(
  '/trainers/:id/sessions',
  authenticate,
  validate(trainerIdParamSchema),
  TrainersController.getTrainerSessions
);
router.get(
  '/trainers/:id/workload',
  authenticate,
  validate(trainerIdParamSchema),
  TrainersController.getTrainerWorkload
);

router.post(
  '/admin/trainers',
  authenticate,
  requireAdmin,
  validate(createTrainerSchema),
  TrainersController.createTrainer
);

router.delete(
  '/admin/trainers/:id',
  authenticate,
  requireAdmin,
  validate(trainerIdParamSchema),
  TrainersController.deleteTrainer
);

router.patch(
  '/admin/trainers/:id',
  authenticate,
  requireTrainerOwnerOrAdmin,
  validate(trainerIdParamSchema),
  validate(updateTrainerSchema),
  TrainersController.updateTrainer
);

export default router;
