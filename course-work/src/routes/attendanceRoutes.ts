import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { AttendanceController } from "../controllers/attendanceControllers.js";
import { AttendanceService } from "../services/attendanceServices.js";
import { AttendanceRepository } from "../repositories/attendanceRepositories.js";
import { validate } from "../middlewares/validate.js";
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

router.get("/", validate(paginationSchema), attendanceController.getAllAttendances);
router.get("/by-id", validate(getAttendanceByIdSchema), attendanceController.getAttendanceById);
router.get("/session/:session_id", validate(getAttendancesBySessionIdSchema), attendanceController.getAttendancesBySessionId);
router.delete("/by-id", validate(deleteAttendanceSchema), attendanceController.deleteAttendance);
router.post("/", validate(createAttendanceSchema), attendanceController.createAttendance);
router.put("/status", validate(updateAttendanceStatusSchema), attendanceController.updateAttendanceStatus);

export default router;
