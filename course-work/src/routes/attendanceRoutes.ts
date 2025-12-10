import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { AttendanceController } from "../controllers/attendanceControllers.js";
import { AttendanceService } from "../services/attendanceServices.js";

const router = Router();
const prisma = new PrismaClient();
const attendanceService = new AttendanceService(prisma);
const attendanceController = new AttendanceController(attendanceService);

// GET /attendance - Отримати список всіх відвідувань
router.get("/", attendanceController.getAllAttendances);

// GET /attendance/by-id - Отримати конкретне відвідування за session_id і client_id
router.get("/by-id", attendanceController.getAttendanceById);

// GET /attendance/session/:session_id - Отримати всі відвідування для конкретної сесії
router.get("/session/:session_id", attendanceController.getAttendancesBySessionId);

export default router;
