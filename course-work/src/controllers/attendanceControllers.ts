import type { Request, Response } from "express";

import type { AttendanceService } from "../services/attendanceServices.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";
import { parseId, parsePaginationParams } from "../utils/validation.js";

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  getAllAttendances = asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = parsePaginationParams(req.query);
    const result = await this.attendanceService.getAllAttendances({ limit, offset });

    res.json(successResponse(result.attendances, { total: result.total }));
  });

  getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
    const { session_id, client_id } = req.query;

    if (!session_id || !client_id || typeof session_id !== "string" || typeof client_id !== "string") {
      return res.status(400).json({ error: "session_id and client_id are required" });
    }

    const sessionIdNum = parseId(session_id, "session ID");
    const clientIdNum = parseId(client_id, "client ID");

    const attendance = await this.attendanceService.getAttendanceById(sessionIdNum, clientIdNum);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance not found" });
    }

    res.json(successResponse(attendance));
  });

  getAttendancesBySessionId = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = parseId(req.params.session_id, "session ID");

    const attendances = await this.attendanceService.getAttendancesBySessionId(sessionId);
    res.json({ ...successResponse(attendances), session_id: sessionId });
  });

  deleteAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { session_id, client_id } = req.query;

    if (!session_id || !client_id || typeof session_id !== "string" || typeof client_id !== "string") {
      return res.status(400).json({
        error: "session_id and client_id are required",
      });
    }

    const sessionIdNum = parseId(session_id, "session ID");
    const clientIdNum = parseId(client_id, "client ID");

    if (sessionIdNum <= 0 || clientIdNum <= 0) {
      return res.status(400).json({
        error: "Invalid session_id or client_id",
      });
    }

    try {
      const result = await this.attendanceService.deleteAttendance(sessionIdNum, clientIdNum);

      res.json(successResponse(result, { message: "Attendance record deleted successfully" }));
    }
    catch (error) {
      if (error instanceof Error && error.message === "Attendance record not found") {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      throw error;
    }
  });

  createAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { session_id, client_id } = req.body;

    if (!session_id || !client_id) {
      return res.status(400).json({
        error: "session_id and client_id are required",
      });
    }

    const sessionIdNum = parseId(String(session_id), "session ID");
    const clientIdNum = parseId(String(client_id), "client ID");

    const result = await this.attendanceService.createAttendance(sessionIdNum, clientIdNum);

    res.status(201).json(successResponse(result, { message: "Attendance record created successfully" }));
  });

  updateAttendanceStatus = asyncHandler(async (req: Request, res: Response) => {
    const { session_id, client_id, status } = req.body;

    const validStatuses = ["booked", "attended", "missed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const sessionIdNum = parseId(String(session_id), "session ID");
    const clientIdNum = parseId(String(client_id), "client ID");

    try {
      const result = await this.attendanceService.updateAttendanceStatus(
        sessionIdNum,
        clientIdNum,
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
