import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { ClassTypeController } from '../controllers/classTypes.controller';
import { ClassTypeService } from '../services/classTypes.service';
import { ClassTypeRepository } from '../repositories/classType.repository';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/authorize';
import {
  createClassTypeSchema,
  getAllClassTypesSchema,
  getClassTypeByIdSchema,
  getClassTypeTrainersSchema,
  updateClassTypeSchema,
  getMonthlyRevenueByClassTypeSchema
} from '../schemas/classType.schema';

const router = Router();
const prisma = new PrismaClient();
const classTypeRepository = new ClassTypeRepository(prisma);
const classTypeService = new ClassTypeService(classTypeRepository);
const classTypeController = new ClassTypeController(classTypeService);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createClassTypeSchema),
  classTypeController.createClassType
);
router.get(
  '/analytics/monthly-revenue',
  authenticate,
  requireAdmin,
  validate(getMonthlyRevenueByClassTypeSchema),
  classTypeController.getMonthlyRevenueByClassType
);
router.get('/', validate(getAllClassTypesSchema), classTypeController.getAllClassTypes);
router.get('/:id', validate(getClassTypeByIdSchema), classTypeController.getClassTypeById);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateClassTypeSchema),
  classTypeController.updateClassType
);
router.get(
  '/:id/trainers',
  validate(getClassTypeTrainersSchema),
  classTypeController.getClassTypeTrainers
);
router.delete('/:id', validate(getClassTypeByIdSchema), classTypeController.delete);

export default router;
