import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { GymController } from "../controllers/gymControllers.js";
import { GymService } from "../services/gymServices.js";

const router = Router();
const prisma = new PrismaClient();
const gymService = new GymService(prisma);
const gymController = new GymController(gymService);

// 2.1. POST /gyms - Створити спортзал
router.post("/", gymController.createGym);

// 2.2. GET /gyms - Отримати всі спортзали
router.get("/", gymController.getAllGyms);

// Вимога 4: GET /gyms/search - Пошук залів за адресою (LIKE)
router.get("/search", gymController.searchGyms);

// Вимога 5: GET /gyms/analytics/utilization - Аналіз завантаженості спортзалів
router.get("/analytics/utilization", gymController.getGymUtilizationAnalysis);

// 2.3. GET /gyms/:id - Отримати спортзал за ID
router.get("/:id", gymController.getGymById);

// 2.4. GET /gyms/:id/rooms - Отримати кімнати спортзалу
router.get("/:id/rooms", gymController.getGymRooms);

// 2.5. GET /gyms/:id/trainers - Отримати тренерів спортзалу
router.get("/:id/trainers", gymController.getGymTrainers);

// 2.6. DELETE /gyms/:id - Жорстке видалення спортзалу
router.delete("/:id", gymController.deleteGym);

export default router;
