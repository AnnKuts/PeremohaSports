import type { PrismaClient, Prisma } from "@prisma/client";
import type { IAttendanceRepository } from "../interfaces/entitiesInterfaces";
import AppError from "../utils/AppError";

export class AttendanceRepository implements IAttendanceRepository {
  constructor(private prisma: PrismaClient) {}

  async hasActiveMembershipForClassType(clientId: number, classTypeId: number): Promise<boolean> {
    const now = new Date();
    const membership = await this.prisma.membership.findFirst({
      where: {
        client_id: clientId,
        class_type_id: classTypeId,
        start_date: { lte: now },
        end_date: { gte: now },
        status: "active",
      },
    });
    return !!membership;
  }

  async getSessionWithRoomAndClassType(sessionId: number): Promise<{ room_id: number, class_type_id: number } | null> {
    const session = await this.prisma.class_session.findUnique({
      where: { session_id: sessionId },
      select: { room_id: true, class_type_id: true },
    });
    return session ? { room_id: session.room_id, class_type_id: session.class_type_id } : null;
  }

  async isClassTypeAllowedInRoom(room_id: number, class_type_id: number): Promise<boolean> {
    const found = await this.prisma.room_class_type.findUnique({
      where: {
        room_id_class_type_id: {
          room_id,
          class_type_id,
        },
      },
    });
    return !!found;
  }

  async findAll(options: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = options;

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { is_deleted: false },
        orderBy: [
          { session_id: "desc" },
          { client_id: "asc" },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.attendance.count({ where: { is_deleted: false } }),
    ]);

    return { attendances, total };
  }

  async findById(sessionId: number, clientId: number) {
    return await this.prisma.attendance.findFirst({
      where: {
        session_id: sessionId,
        client_id: clientId,
        is_deleted: false,
      },
    });
  }

  async findBySessionId(sessionId: number) {
    return await this.prisma.attendance.findMany({
      where: { session_id: sessionId, is_deleted: false },
      orderBy: {
        client_id: "asc",
      },
    });
  }

  async delete(sessionId: number, clientId: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
    });
    return await this.prisma.attendance.update({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
      data: {
        is_deleted: true,
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
        throw new AppError("Attendance record not found", 404);
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
