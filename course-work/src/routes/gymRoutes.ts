import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { GymController } from "../controllers/gymControllers.js";
import { GymService } from "../services/gymServices.js";
import { GymRepository } from "../repositories/gymRepositories.js";
import { validate } from "../middlewares/validation.js";
import {
  createGymSchema,
  getAllGymsSchema,
  getGymByIdSchema,
  deleteGymSchema,
  getGymRoomsSchema,
  getGymTrainersSchema,
  searchGymsByAddressSchema,
} from "../schemas/gymSchemas.js";

const router = Router();
const prisma = new PrismaClient();
const gymRepository = new GymRepository(prisma);
const gymService = new GymService(gymRepository);
const gymController = new GymController(gymService);

// 2.1. POST /gyms - Створити спортзал
router.post("/", validate(createGymSchema), gymController.createGym);

// 2.2. GET /gyms - Отримати всі спортзали
router.get("/", validate(getAllGymsSchema), gymController.getAllGyms);

// Вимога 4: GET /gyms/search - Пошук залів за адресою (LIKE)
router.get("/search", validate(searchGymsByAddressSchema), gymController.searchGyms);

// Вимога 5: GET /gyms/analytics/utilization - Аналіз завантаженості спортзалів
router.get("/analytics/utilization", gymController.getGymUtilizationAnalysis);

// 2.3. GET /gyms/:id - Отримати спортзал за ID
router.get("/:id", validate(getGymByIdSchema), gymController.getGymById);

// 2.4. GET /gyms/:id/rooms - Отримати кімнати спортзалу
router.get("/:id/rooms", validate(getGymRoomsSchema), gymController.getGymRooms);

// 2.5. GET /gyms/:id/trainers - Отримати тренерів спортзалу
router.get("/:id/trainers", validate(getGymTrainersSchema), gymController.getGymTrainers);

// 2.6. DELETE /gyms/:id - Жорстке видалення спортзалу
router.delete("/:id", validate(deleteGymSchema), gymController.deleteGym);

export default router;
