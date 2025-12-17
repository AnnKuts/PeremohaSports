import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { AttendanceController } from "../controllers/attendanceControllers.js";
import { AttendanceService } from "../services/attendanceServices.js";
import { AttendanceRepository } from "../repositories/attendanceRepositories.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate"; 
import { requireTrainerRole, requireAdmin } from "../middlewares/authorize";
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

router.get("/", authenticate, requireAdmin, validate(paginationSchema), attendanceController.getAllAttendances);
router.get("/by-id", authenticate, requireAdmin, validate(getAttendanceByIdSchema), attendanceController.getAttendanceById);
router.get("/session/:session_id", authenticate, requireTrainerRole, validate(getAttendancesBySessionIdSchema), attendanceController.getAttendancesBySessionId);
router.delete("/by-id", authenticate, requireAdmin, validate(deleteAttendanceSchema), attendanceController.deleteAttendance);
router.post("/", authenticate, requireTrainerRole, validate(createAttendanceSchema), attendanceController.createAttendance);
router.put("/status", authenticate, requireTrainerRole, validate(updateAttendanceStatusSchema), attendanceController.updateAttendanceStatus);

export default router;
