import type { PrismaClient } from "@prisma/client";

export class AttendanceService {
  constructor(private prisma: PrismaClient) {}

  async getAllAttendances(options: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = options;

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        orderBy: [
          { session_id: "desc" },
          { client_id: "asc" },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.attendance.count(),
    ]);

    return { attendances, total };
  }

  async getAttendanceById(sessionId: number, clientId: number) {
    return await this.prisma.attendance.findUnique({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
    });
  }

  async getAttendancesBySessionId(sessionId: number) {
    return await this.prisma.attendance.findMany({
      where: { session_id: sessionId },
      orderBy: {
        client_id: "asc",
      },
    });
  }

  async deleteAttendance(sessionId: number, clientId: number) {
    console.log("Service: Starting delete for attendance:", { sessionId, clientId });

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
    });

    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    console.log(`Deleting attendance record (status: ${attendance.status})`);

    const deletedAttendance = await this.prisma.attendance.delete({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
    });

    console.log("Service: Attendance deleted successfully");

    return {
      success: true,
      deletedAttendance,
    };
  }

  async createAttendance(sessionId: number, clientId: number) {
    console.log("Service: Creating attendance record");

    const newAttendance = await this.prisma.attendance.create({
      data: {
        session_id: sessionId,
        client_id: clientId,
        status: "booked",
      },
    });

    console.log(`Created attendance record for session ${sessionId}, client ${clientId}`);

    return {
      success: true,
      attendance: newAttendance,
    };
  }

  // вимога 3 оновлення (статусу відвідування)
  async updateAttendanceStatus(sessionId: number, clientId: number, newStatus: "booked" | "attended" | "missed" | "cancelled") {
    console.log("Service: Updating attendance status with transaction");

    return await this.prisma.$transaction(async (tx) => {
      const currentAttendance = await tx.attendance.findUnique({
        where: {
          session_id_client_id: {
            session_id: sessionId,
            client_id: clientId,
          },
        },
      });

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

      const updatedAttendance = await tx.attendance.updateMany({
        where: {
          session_id: sessionId,
          client_id: clientId,
          status: oldStatus,
        },
        data: { status: newStatus },
      });

      if (updatedAttendance.count === 0) {
        throw new Error("Status was changed by another user. Please refresh and try again");
      }

      console.log(`Status updated from '${oldStatus}' to '${newStatus}'`);

      return {
        success: true,
        oldStatus,
        newStatus,
        sessionId,
        clientId,
      };
    });
  }
}
