import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { RoomController } from "../controllers/roomControllers.js";
import { RoomService } from "../services/roomServices.js";
import { RoomRepository } from "../repositories/roomRepositories.js";
import { validate } from "../middlewares/validation.js";
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
} from "../schemas/roomSchemas.js";

const router = Router();
const prisma = new PrismaClient();
const roomRepository = new RoomRepository(prisma);
const roomService = new RoomService(roomRepository);
const roomController = new RoomController(roomService);

// 2.6. POST /rooms - Створити кімнату
router.post("/", validate(createRoomSchema), roomController.createRoom);

// 2.7. GET /rooms - Отримати всі кімнати
router.get("/", validate(getAllRoomsSchema), roomController.getAllRooms);

// 2.14. Вимога 4: GET /rooms/search - Пошук кімнат з фільтрами (WHERE з кількома умовами)
router.get("/search", validate(searchRoomsSchema), roomController.searchRooms);

// 2.8. GET /rooms/:id - Отримати кімнату за ID
router.get("/:id", validate(getRoomByIdSchema), roomController.getRoomById);

// 2.9. GET /rooms/:id/sessions - Отримати сесії кімнати
router.get("/:id/sessions", validate(getRoomSessionsSchema), roomController.getRoomSessions);

// 2.10. GET /rooms/:id/class-types - Отримати типи занять кімнати
router.get("/:id/class-types", validate(getRoomClassTypesSchema), roomController.getRoomClassTypes);

// 2.11. POST /rooms/class-type - Додати тип заняття до кімнати
router.post("/class-type", validate(createRoomClassTypeSchema), roomController.createRoomClassType);

// 2.12. DELETE /rooms/:id - Жорстке видалення кімнати
router.delete("/:id", validate(deleteRoomSchema), roomController.deleteRoom);

// 2.13. PUT /rooms/:id:capacity - Оновити вмісткість кімнати
router.put("/:id/capacity", validate(updateRoomCapacitySchema), roomController.updateRoomCapacity);

export default router;
