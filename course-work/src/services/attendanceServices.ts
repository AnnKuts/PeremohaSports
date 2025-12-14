import AppError from "../utils/AppError";
import { handlePrismaError } from "../utils/handlePrismaError";
import type { IAttendanceRepository } from "../interfaces/entitiesInterfaces";

export class AttendanceService {
  constructor(private attendanceRepository: IAttendanceRepository) {}

  async getAllAttendances(options: { limit?: number; offset?: number } = {}) {
    return await this.attendanceRepository.findAll(options);
  }

  async getAttendanceById(sessionId: number, clientId: number) {
    const attendance = await this.attendanceRepository.findById(sessionId, clientId);
    if (!attendance) {
      throw new AppError("Attendance not found", 404);
    }
    return attendance;
  }

  async getAttendancesBySessionId(sessionId: number) {
    return await this.attendanceRepository.findBySessionId(sessionId);
  }

  async deleteAttendance(sessionId: number, clientId: number) {
    const attendance = await this.attendanceRepository.findById(sessionId, clientId);

    if (!attendance) {
      throw new AppError("Attendance record not found", 404);
    }

    const deletedAttendance = await this.attendanceRepository.delete(sessionId, clientId);

    return {
      success: true,
      deletedAttendance,
    };
  }

  async createAttendance(sessionId: number, clientId: number) {
    const session = await this.attendanceRepository.getSessionWithRoomAndClassType(sessionId);
    if (!session) {
      throw new AppError("Session not found", 404);
    }
    const isAllowed = await this.attendanceRepository.isClassTypeAllowedInRoom(session.room_id, session.class_type_id);
    if (!isAllowed) {
      throw new AppError("Client cannot be enrolled: the selected activity type is not allowed in this room", 400);
    }

    const hasMembership = await this.attendanceRepository.hasActiveMembershipForClassType(clientId, session.class_type_id);
    if (!hasMembership) {
      throw new AppError("Client does not have an active membership for this class type", 400);
    }

    try {
      const newAttendance = await this.attendanceRepository.create(sessionId, clientId, "booked");
      return {
        success: true,
        attendance: newAttendance,
      };
    } catch (err: any) {
      throw handlePrismaError(err);
    }
  }

  async updateAttendanceStatus(sessionId: number, clientId: number, newStatus: "booked" | "attended" | "missed" | "cancelled") {
    const currentAttendance = await this.attendanceRepository.findById(sessionId, clientId);
    
    if (!currentAttendance) {
      throw new AppError("Attendance record not found", 404);
    }

    const oldStatus = currentAttendance.status;

    if (oldStatus === "attended" && newStatus !== "attended") {
      throw new AppError(`Cannot change status from 'attended' to '${newStatus}'`, 400);
    }

    if (oldStatus === newStatus) {
      throw new AppError(`Status is already '${newStatus}'`, 400);
    }

    return await this.attendanceRepository.updateStatus(sessionId, clientId, newStatus);
  }
}
