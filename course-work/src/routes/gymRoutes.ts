import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { GymController } from "../controllers/gymControllers.js";
import { GymService } from "../services/gymServices.js";
import { GymRepository } from "../repositories/gymRepositories.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate"; 
import { requireAdmin } from "../middlewares/authorize";
import {
  createGymSchema,
  getAllGymsSchema,
  getGymByIdSchema,
  deleteGymSchema,
  getGymRoomsSchema,
  getGymTrainersSchema,
  searchGymsByAddressSchema,
} from "../schemas/gymSchemas.js";
import { updateGymSchema } from "../schemas/gymSchemas.js";


const router = Router();
const prisma = new PrismaClient();
const gymRepository = new GymRepository(prisma);
const gymService = new GymService(gymRepository);
const gymController = new GymController(gymService);

router.post("/", authenticate, requireAdmin, validate(createGymSchema), gymController.createGym);
router.get("/", validate(getAllGymsSchema), gymController.getAllGyms);
router.get("/search", validate(searchGymsByAddressSchema), gymController.searchGyms);
router.get("/analytics/utilization", authenticate, requireAdmin, gymController.getGymUtilizationAnalysis);
router.get("/:id", validate(getGymByIdSchema), gymController.getGymById);
router.get("/:id/rooms", validate(getGymRoomsSchema), gymController.getGymRooms);
router.get("/:id/trainers", validate(getGymTrainersSchema), gymController.getGymTrainers);
router.delete("/:id", authenticate, requireAdmin, validate(deleteGymSchema), gymController.deleteGym);
router.put("/:id", authenticate, requireAdmin, validate(updateGymSchema), gymController.updateGym);

export default router;
