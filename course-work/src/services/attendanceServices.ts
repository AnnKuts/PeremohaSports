import type { IAttendanceRepository } from "../interfaces/entitiesInterfaces";

export class AttendanceService {
  constructor(private attendanceRepository: IAttendanceRepository) {}

  async getAllAttendances(options: { limit?: number; offset?: number } = {}) {
    return await this.attendanceRepository.findAll(options);
  }

  async getAttendanceById(sessionId: number, clientId: number) {
    return await this.attendanceRepository.findById(sessionId, clientId);
  }

  async getAttendancesBySessionId(sessionId: number) {
    return await this.attendanceRepository.findBySessionId(sessionId);
  }

  async deleteAttendance(sessionId: number, clientId: number) {
    const attendance = await this.attendanceRepository.findById(sessionId, clientId);

    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    const deletedAttendance = await this.attendanceRepository.delete(sessionId, clientId);

    return {
      success: true,
      deletedAttendance,
    };
  }

  async createAttendance(sessionId: number, clientId: number) {
    const newAttendance = await this.attendanceRepository.create(sessionId, clientId, "booked");

    return {
      success: true,
      attendance: newAttendance,
    };
  }

  async updateAttendanceStatus(sessionId: number, clientId: number, newStatus: "booked" | "attended" | "missed" | "cancelled") {
    const currentAttendance = await this.attendanceRepository.findById(sessionId, clientId);
    
    if (!currentAttendance) {
      throw new Error("Attendance record not found");
    }

    const oldStatus = currentAttendance.status;

    if (oldStatus === "attended" && newStatus !== "attended") {
      throw new Error(`Cannot change status from 'attended' to '${newStatus}'`);
    }

    if (oldStatus === newStatus) {
      throw new Error(`Status is already '${newStatus}'`);
    }

    return await this.attendanceRepository.updateStatus(sessionId, clientId, newStatus);
  }
}
