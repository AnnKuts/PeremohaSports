import type { Response } from "express";

import type { AttendanceService } from "../services/attendanceServices.js";
import type { ValidatedRequest } from "../types/requests.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  getAllAttendances = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { limit, offset } = req.validated?.query || {};
    const result = await this.attendanceService.getAllAttendances({ limit, offset });

    res.json(successResponse(result.attendances, { total: result.total }));
  });

  getAttendanceById = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id } = req.validated?.query || {};

    const attendance = await this.attendanceService.getAttendanceById(session_id, client_id);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance not found" });
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

    try {
      const result = await this.attendanceService.deleteAttendance(session_id, client_id);

      res.json(successResponse(result, { message: "Attendance record deleted successfully" }));
    }
    catch (error) {
      if (error instanceof Error && error.message === "Attendance record not found") {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      throw error;
    }
  });

  createAttendance = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id } = req.validated?.body || {};

    const result = await this.attendanceService.createAttendance(session_id, client_id);

    res.status(201).json(successResponse(result, { message: "Attendance record created successfully" }));
  });

  updateAttendanceStatus = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { session_id, client_id, status } = req.validated?.body || {};

    try {
      const result = await this.attendanceService.updateAttendanceStatus(
        session_id,
        client_id,
        status,
      );

      res.json(successResponse(result, { message: "Status updated successfully" }));
    }
    catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Cannot change") || error.message.includes("already")) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("changed by another user")) {
          return res.status(409).json({ error: error.message });
        }
      }

      throw error;
    }
  });
}
