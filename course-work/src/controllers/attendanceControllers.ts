import type { NextFunction, Request, Response } from "express";

import type { AttendanceService } from "../services/attendanceServices.js";

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  getAllAttendances = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;
      const result = await this.attendanceService.getAllAttendances({
        limit: limit ? Number.parseInt(limit as string) : undefined,
        offset: offset ? Number.parseInt(offset as string) : undefined,
      });

      res.json({ success: true, data: result.attendances, total: result.total });
    }
    catch (error) {
      next(error);
    }
  };

  getAttendanceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { session_id, client_id } = req.query;

      if (!session_id || !client_id) {
        return res.status(400).json({ error: "session_id and client_id are required" });
      }

      const sessionIdNum = Number.parseInt(session_id as string);
      const clientIdNum = Number.parseInt(client_id as string);

      if (Number.isNaN(sessionIdNum) || Number.isNaN(clientIdNum)) {
        return res.status(400).json({ error: "Invalid session_id or client_id" });
      }

      const attendance = await this.attendanceService.getAttendanceById(sessionIdNum, clientIdNum);
      if (!attendance) {
        return res.status(404).json({ error: "Attendance not found" });
      }

      res.json({ success: true, data: attendance });
    }
    catch (error) {
      next(error);
    }
  };

  getAttendancesBySessionId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = Number.parseInt(req.params.session_id);
      if (Number.isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session_id" });
      }

      const attendances = await this.attendanceService.getAttendancesBySessionId(sessionId);
      res.json({ success: true, data: attendances, session_id: sessionId });
    }
    catch (error) {
      next(error);
    }
  };

  deleteAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { session_id, client_id } = req.query;

      if (!session_id || !client_id) {
        return res.status(400).json({ 
          error: "session_id and client_id are required" 
        });
      }

      const sessionIdNum = parseInt(session_id as string);
      const clientIdNum = parseInt(client_id as string);

      if (isNaN(sessionIdNum) || isNaN(clientIdNum) || sessionIdNum <= 0 || clientIdNum <= 0) {
        return res.status(400).json({ 
          error: "Invalid session_id or client_id" 
        });
      }

      console.log('Controller: Initiating delete for attendance:', { sessionIdNum, clientIdNum });

      const result = await this.attendanceService.deleteAttendance(sessionIdNum, clientIdNum);

      res.json({
        success: true,
        message: 'Attendance record deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller: Error deleting attendance:', error);
      
      if (error instanceof Error && error.message === 'Attendance record not found') {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      next(error);
    }
  };
}
