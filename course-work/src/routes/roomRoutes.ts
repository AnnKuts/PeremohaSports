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

// Додатковий роут для типів класів кімнати
router.get("/:id/class-types", roomController.getRoomClassTypes);

// POST /rooms/class-type - Створити зв'язок між кімнатою і типом заняття
router.post("/class-type", roomController.createRoomClassType);

export default router;
