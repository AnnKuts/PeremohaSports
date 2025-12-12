import type { PrismaClient, Prisma } from "@prisma/client";
import type { IAttendanceRepository } from "../interfaces/entitiesInterfaces";

export class AttendanceRepository implements IAttendanceRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options: { limit?: number; offset?: number } = {}) {
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

  async findById(sessionId: number, clientId: number) {
    return await this.prisma.attendance.findUnique({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
    });
  }

  async findBySessionId(sessionId: number) {
    return await this.prisma.attendance.findMany({
      where: { session_id: sessionId },
      orderBy: {
        client_id: "asc",
      },
    });
  }

  async delete(sessionId: number, clientId: number) {
    return await this.prisma.attendance.delete({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
    });
  }

  async create(sessionId: number, clientId: number, status: string) {
    return await this.prisma.attendance.create({
      data: {
        session_id: sessionId,
        client_id: clientId,
        status: status as any,
      },
    });
  }

  async updateStatus(sessionId: number, clientId: number, newStatus: string) {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

      const updatedAttendance = await tx.attendance.update({
        where: {
          session_id_client_id: {
            session_id: sessionId,
            client_id: clientId,
          },
        },
        data: { status: newStatus as any },
      });

      return {
        success: true,
        attendance: updatedAttendance,
        changes: {
          from: oldStatus,
          to: newStatus,
        },
      };
    });
  }
}
