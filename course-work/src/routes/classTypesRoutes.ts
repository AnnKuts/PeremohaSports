import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { ClassTypeController } from "../controllers/classTypesControllers.js";
import { ClassTypeService } from "../services/classTypesServices.js";
import { ClassTypeRepository } from "../repositories/classTypeRepositories.js";
import { validate } from "../middlewares/validation.js";
import {
  createClassTypeSchema,
  getAllClassTypesSchema,
  getClassTypeByIdSchema,
  getClassTypeTrainersSchema,
} from "../schemas/classTypeSchemas.js";

const router = Router();
const prisma = new PrismaClient();
const classTypeRepository = new ClassTypeRepository(prisma);
const classTypeService = new ClassTypeService(classTypeRepository);
const classTypeController = new ClassTypeController(classTypeService);

// 2.12. POST /class-types - Створити тип класу
router.post("/", validate(createClassTypeSchema), classTypeController.createClassType);

// 2.13. GET /class-types - Отримати всі типи класів
router.get("/", validate(getAllClassTypesSchema), classTypeController.getAllClassTypes);

// 2.14. GET /class-types/:id - Отримати тип класу за ID
router.get("/:id", validate(getClassTypeByIdSchema), classTypeController.getClassTypeById);

// 2.15. GET /class-types/:id/trainers - Отримати тренерів типу класу
router.get("/:id/trainers", validate(getClassTypeTrainersSchema), classTypeController.getClassTypeTrainers);

export default router;
