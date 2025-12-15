import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { RoomController } from "../controllers/roomControllers.js";
import { RoomService } from "../services/roomServices.js";
import { RoomRepository } from "../repositories/roomRepositories.js";
import { validate } from "../middlewares/validate.js";
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

router.post("/", validate(createRoomSchema), roomController.createRoom);
router.get("/", validate(getAllRoomsSchema), roomController.getAllRooms);
router.get("/search", validate(searchRoomsSchema), roomController.searchRooms);
router.get("/:id", validate(getRoomByIdSchema), roomController.getRoomById);
router.get("/:id/sessions", validate(getRoomSessionsSchema), roomController.getRoomSessions);
router.get("/:id/class-types", validate(getRoomClassTypesSchema), roomController.getRoomClassTypes);
router.post("/class-type", validate(createRoomClassTypeSchema), roomController.createRoomClassType);
router.delete("/:id", validate(deleteRoomSchema), roomController.deleteRoom);
router.put("/:id/capacity", validate(updateRoomCapacitySchema), roomController.updateRoomCapacity);
router.get("/analytics/room-revenue", validate(getRoomRevenueAndAttendanceSchema), roomController.getRoomRevenueAndAttendance);

export default router;
