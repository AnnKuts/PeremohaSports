import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { ClassTypeController } from "../controllers/classTypesControllers.js";
import { ClassTypeService } from "../services/classTypesServices.js";

const router = Router();
const prisma = new PrismaClient();
const classTypeService = new ClassTypeService(prisma);
const classTypeController = new ClassTypeController(classTypeService);

// 2.12. POST /class-types - Створити тип класу
router.post("/", classTypeController.createClassType);

// 2.13. GET /class-types - Отримати всі типи класів
router.get("/", classTypeController.getAllClassTypes);

// 2.14. GET /class-types/:id - Отримати тип класу за ID
router.get("/:id", classTypeController.getClassTypeById);

// 2.15. GET /class-types/:id/trainers - Отримати тренерів типу класу
router.get("/:id/trainers", classTypeController.getClassTypeTrainers);

export default router;
