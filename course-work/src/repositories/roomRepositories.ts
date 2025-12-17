import type { PrismaClient, Prisma } from "@prisma/client";
import type { IRoomRepository } from "../interfaces/entitiesInterfaces";
import { softDeleteRoom } from "./sharedRepositoryFunc";
import AppError from "../utils/AppError";

export class RoomRepository implements IRoomRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any) {
    return await this.prisma.room.create({
      data: { capacity: data.capacity, gym_id: data.gym_id },
      include: {
        gym: true,
        _count: { select: { room_class_type: true } },
      },
    });
  }

  async findAll(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    const { includeStats = true, limit, offset } = options;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where: { is_deleted: false },
        include: includeStats
          ? {
              gym: true,
              _count: { select: { room_class_type: true } },
            }
          : undefined,
        orderBy: { room_id: "asc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.room.count({ where: { is_deleted: false } }),
    ]);

    return { rooms, total };
  }

  async findById(roomId: number) {
    return await this.prisma.room.findFirst({
      where: { room_id: roomId, is_deleted: false },
      include: {
        gym: true,
        _count: {
          select: {
            room_class_type: true,
          },
        },
      },
    });
  }

  async delete(roomId: number) {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await softDeleteRoom(tx, roomId);
      return await tx.room.findUnique({ where: { room_id: roomId } });
    });
  }

  async findClassTypesByRoomId(roomId: number, options: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = options;
    return await this.prisma.room_class_type.findMany({
      where: { room_id: roomId },
      include: {
        class_type: true,
        _count: { select: { class_session: true } },
      },
      take: limit,
      skip: offset,
    });
  }

  async findSessionsByRoomId(roomId: number, options: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = options;
    return await this.prisma.class_session.findMany({
      where: { room_id: roomId },
      include: {
        room_class_type: {
          include: {
            class_type: true,
          },
        },
        trainer: {
          include: {
            contact_data: true,
          },
        },
        _count: { select: { attendance: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async createRoomClassType(roomId: number, classTypeId: number) {
    return await this.prisma.room_class_type.create({
      data: {
        room_id: roomId,
        class_type_id: classTypeId,
      },
      include: {
        room: {
          include: {
            gym: true,
          },
        },
        class_type: true,
      },
    });
  }

  async searchRooms(filters: {
    minCapacity?: number;
    maxCapacity?: number;
    gymId?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    const { minCapacity, maxCapacity, gymId, limit, offset } = filters;

    const where: any = {};

    if (minCapacity !== undefined && maxCapacity !== undefined) {
      where.capacity = {
        gte: minCapacity,
        lte: maxCapacity,
      };
    } else if (minCapacity !== undefined) {
      where.capacity = { gte: minCapacity };
    } else if (maxCapacity !== undefined) {
      where.capacity = { lte: maxCapacity };
    }

    if (gymId !== undefined) {
      where.gym_id = gymId;
    }

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: {
          gym: true,
          _count: { select: { room_class_type: true } },
        },
        orderBy: { capacity: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.room.count({ where }),
    ]);

    return { rooms, total };
  }

  async updateCapacity(roomId: number, newCapacity: number) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await tx.room.findUnique({
        where: { room_id: roomId },
      });

      if (!room) {
        throw new AppError("Room not found", 404);
      }

      const oldCapacity = room.capacity;

      if (newCapacity < oldCapacity) {
        const sessions = await tx.class_session.findMany({
          where: {
            room_class_type: { room_id: roomId },
            date: { gte: new Date() },
          },
          include: {
            _count: {
              select: {
                attendance: {
                  where: {
                    status: { in: ["booked", "attended"] },
                  },
                },
              },
            },
          },
        });

        const hasConflicts = sessions.some(
          (session: typeof sessions[0]) => session._count.attendance > newCapacity,
        );

        if (hasConflicts) {
          throw new AppError(
            `Cannot reduce capacity to ${newCapacity}: some future sessions already have more bookings`,
            400,
          );
        }
      }

      const updateResult = await tx.room.updateMany({
        where: {
          room_id: roomId,
          capacity: oldCapacity,
        },
        data: { capacity: newCapacity },
      });

      if (updateResult.count === 0) {
        throw new AppError(
          "Room capacity was changed by another admin. Please refresh and try again",
          409,
        );
      }

      const updatedSessions = await tx.class_session.updateMany({
        where: {
          room_class_type: { room_id: roomId },
          date: { gte: new Date() },
        },
        data: { capacity: newCapacity },
      });

      return {
        success: true,
        from: oldCapacity,
        to: newCapacity,
        affectedSessions: updatedSessions.count,
      };
    });
  }

  async getRoomRevenueAndAttendance() {
    return await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        g.gym_id,
        g.address AS gym_address,
        r.room_id,
        r.capacity AS room_capacity,
        COUNT(a.session_id) AS attendance_count,
        SUM(m.price) AS total_revenue
      FROM gym g
      JOIN room r ON r.gym_id = g.gym_id
      JOIN class_session cs ON cs.room_id = r.room_id
      JOIN attendance a ON a.session_id = cs.session_id
      JOIN membership m ON m.client_id = a.client_id AND cs.class_type_id = m.class_type_id
      WHERE a.status IN ('attended', 'booked')
      GROUP BY g.gym_id, g.address, r.room_id, r.capacity
      ORDER BY total_revenue DESC, attendance_count DESC;
    `);
  }
}
