import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { RoomController } from "../controllers/roomControllers.js";
import { RoomService } from "../services/roomServices.js";

const router = Router();
const prisma = new PrismaClient();
const roomService = new RoomService(prisma);
const roomController = new RoomController(roomService);

// 2.6. POST /rooms - Створити кімнату
router.post("/", roomController.createRoom);

// 2.7. GET /rooms - Отримати всі кімнати
router.get("/", roomController.getAllRooms);

// 2.8. GET /rooms/:id - Отримати кімнату за ID
router.get("/:id", roomController.getRoomById);

// 2.9. GET /rooms/:id/sessions - Отримати сесії кімнати
router.get("/:id/sessions", roomController.getRoomSessions);

// 2.10. GET /rooms/:id/class-types - Отримати типи занять кімнати
router.get("/:id/class-types", roomController.getRoomClassTypes);

// 2.11. POST /rooms/class-type - Додати тип заняття до кімнати
router.post("/class-type", roomController.createRoomClassType);

// 2.12. DELETE /rooms/:id - Жорстке видалення кімнати
router.delete("/:id", roomController.deleteRoom);

export default router;
