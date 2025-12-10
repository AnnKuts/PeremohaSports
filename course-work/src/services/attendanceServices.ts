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
    console.log('Service: Starting delete for attendance:', { sessionId, clientId });
    
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId
        }
      }
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    console.log(`Deleting attendance record (status: ${attendance.status})`);

    const deletedAttendance = await this.prisma.attendance.delete({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId
        }
      }
    });

    console.log('Service: Attendance deleted successfully');
    
    return {
      success: true,
      deletedAttendance
    };
  }
}
