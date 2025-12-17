import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { RoomController } from "../controllers/roomControllers.js";
import { RoomService } from "../services/roomServices.js";
import { RoomRepository } from "../repositories/roomRepositories.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate"; 
import { requireAdmin } from "../middlewares/authorize";
import {
  createRoomSchema,
  getAllRoomsSchema,
  getRoomByIdSchema,
  getRoomClassTypesSchema,
  getRoomSessionsSchema,
  createRoomClassTypeSchema,
  updateRoomCapacitySchema,
  deleteRoomSchema,
  searchRoomsSchema,
  getRoomRevenueAndAttendanceSchema,
} from "../schemas/roomSchemas.js";

const router = Router();
const prisma = new PrismaClient();
const roomRepository = new RoomRepository(prisma);
const roomService = new RoomService(roomRepository);
const roomController = new RoomController(roomService);

router.post("/", authenticate, requireAdmin, validate(createRoomSchema), roomController.createRoom);
router.get("/", validate(getAllRoomsSchema), roomController.getAllRooms);
router.get("/search", validate(searchRoomsSchema), roomController.searchRooms);
router.get("/:id", validate(getRoomByIdSchema), roomController.getRoomById);
router.get("/:id/sessions", validate(getRoomSessionsSchema), roomController.getRoomSessions);
router.get("/:id/class-types", validate(getRoomClassTypesSchema), roomController.getRoomClassTypes);
router.post("/class-type", authenticate, requireAdmin, validate(createRoomClassTypeSchema), roomController.createRoomClassType);
router.delete("/:id", authenticate, requireAdmin, validate(deleteRoomSchema), roomController.deleteRoom);
router.put("/:id/capacity", authenticate, requireAdmin, validate(updateRoomCapacitySchema), roomController.updateRoomCapacity);

export default router;
