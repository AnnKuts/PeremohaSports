import type { Response } from "express";

import type { AttendanceService } from "../services/attendanceServices.js";
import type { ValidatedRequest } from "../types/requests.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";
import AppError from "../utils/AppError.js";

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  getAllAttendances = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { limit, offset } = req.validated?.query || {};
    const result = await this.attendanceService.getAllAttendances({ limit, offset });
    res.json(successResponse(result.attendances, { total: result.total }));
  });

  getAttendanceById = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id } = req.validated?.query || {};
    const sessionId = Number(session_id);
    const clientId = Number(client_id);
    if (isNaN(sessionId) || isNaN(clientId)) {
      throw new AppError("Invalid session_id or client_id", 400);
    }
    const attendance = await this.attendanceService.getAttendanceById(sessionId, clientId);
    if (!attendance) {
      throw new AppError("Attendance not found", 404);
    }
    res.json(successResponse(attendance));
  });

  getAttendancesBySessionId = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id } = req.validated?.params || {};

    const attendances = await this.attendanceService.getAttendancesBySessionId(session_id);
    res.json({ ...successResponse(attendances), session_id });
  });

  deleteAttendance = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id } = req.validated?.query || {};

    const result = await this.attendanceService.deleteAttendance(Number(session_id), Number(client_id));
    res.json(successResponse(result, { message: "Attendance record deleted successfully" }));
  });

  createAttendance = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id } = req.validated?.body || {};

    const result = await this.attendanceService.createAttendance(session_id, client_id);

    res.status(201).json(successResponse(result, { message: "Attendance record created successfully" }));
  });

  updateAttendanceStatus = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id, status } = req.validated?.body || {};
    const result = await this.attendanceService.updateAttendanceStatus(
      session_id,
      client_id,
      status,
    );
    res.json(successResponse(result, { message: "Status updated successfully" }));
  });
}
