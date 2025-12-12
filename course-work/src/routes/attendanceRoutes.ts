import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { AttendanceController } from "../controllers/attendanceControllers.js";
import { AttendanceService } from "../services/attendanceServices.js";
import { AttendanceRepository } from "../repositories/attendanceRepositories.js";
import { validate } from "../middlewares/validation.js";
import {
  getAttendanceByIdSchema,
  getAttendancesBySessionIdSchema,
  createAttendanceSchema,
  updateAttendanceStatusSchema,
  deleteAttendanceSchema,
  paginationSchema,
} from "../schemas/attendanceSchemas.js";

const router = Router();
const prisma = new PrismaClient();
const attendanceRepository = new AttendanceRepository(prisma);
const attendanceService = new AttendanceService(attendanceRepository);
const attendanceController = new AttendanceController(attendanceService);

// GET /attendance - Отримати список всіх відвідувань
router.get("/", validate(paginationSchema), attendanceController.getAllAttendances);

// GET /attendance/by-id - Отримати конкретне відвідування за session_id і client_id
router.get("/by-id", validate(getAttendanceByIdSchema), attendanceController.getAttendanceById);

// GET /attendance/session/:session_id - Отримати всі відвідування для конкретної сесії
router.get("/session/:session_id", validate(getAttendancesBySessionIdSchema), attendanceController.getAttendancesBySessionId);

// DELETE /attendance/by-id - Жорстке видалення відвідування
router.delete("/:session_id/:client_id", attendanceController.deleteAttendance);router.delete("/:session_id/:client_id", attendanceController.deleteAttendance);
// POST /attendance - Створити нове відвідування
router.post("/", validate(createAttendanceSchema), attendanceController.createAttendance);

// ТРАНЗАКЦІЇ
// PUT /attendance/status - Оновити статус відвідування
router.put("/status", validate(updateAttendanceStatusSchema), attendanceController.updateAttendanceStatus);

export default router;
