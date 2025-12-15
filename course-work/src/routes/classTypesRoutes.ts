import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { ClassTypeController } from "../controllers/classTypesControllers.js";
import { ClassTypeService } from "../services/classTypesServices.js";
import { ClassTypeRepository } from "../repositories/classTypeRepositories.js";
import { validate } from "../middlewares/validate.js";
import {
  createClassTypeSchema,
  getAllClassTypesSchema,
  getClassTypeByIdSchema,
  getClassTypeTrainersSchema,
  updateClassTypeSchema,
  getMonthlyRevenueByClassTypeSchema,
} from "../schemas/classTypeSchemas.js";

const router = Router();
const prisma = new PrismaClient();
const classTypeRepository = new ClassTypeRepository(prisma);
const classTypeService = new ClassTypeService(classTypeRepository);
const classTypeController = new ClassTypeController(classTypeService);


router.post("/", validate(createClassTypeSchema), classTypeController.createClassType);
router.get("/analytics/monthly-revenue", validate(getMonthlyRevenueByClassTypeSchema), classTypeController.getMonthlyRevenueByClassType);
router.get("/", validate(getAllClassTypesSchema), classTypeController.getAllClassTypes);
router.get("/:id", validate(getClassTypeByIdSchema), classTypeController.getClassTypeById);
router.put("/:id", validate(updateClassTypeSchema), classTypeController.updateClassType);
router.get("/:id/trainers", validate(getClassTypeTrainersSchema), classTypeController.getClassTypeTrainers);
router.delete("/:id", validate(getClassTypeByIdSchema), classTypeController.delete);

export default router;
