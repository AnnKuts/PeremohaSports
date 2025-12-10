import type { PrismaClient } from "@prisma/client";

import type { CreateRoomData } from "../types/index.js";

export class RoomService {
  constructor(private prisma: PrismaClient) {}

  async createRoom(data: CreateRoomData) {
    return await this.prisma.room.create({
      data: { capacity: data.capacity, gym_id: data.gym_id },
      include: {
        gym: true,
        _count: { select: { room_class_type: true } },
      },
    });
  }

  async getAllRooms(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    const { includeStats = true, limit, offset } = options;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
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
      this.prisma.room.count(),
    ]);

    return { rooms, total };
  }

  async getRoomById(roomId: number) {
    return await this.prisma.room.findUnique({
      where: { room_id: roomId },
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

  async getRoomClassTypes(roomId: number) {
    return await this.prisma.room_class_type.findMany({
      where: { room_id: roomId },
      include: {
        class_type: true,
        _count: { select: { class_session: true } },
      },
    });
  }

  async getRoomSessions(roomId: number) {
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

  async deleteRoom(roomId: number) {
    const room = await this.prisma.room.findUnique({
      where: { room_id: roomId },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    const deletedRoom = await this.prisma.room.delete({
      where: { room_id: roomId },
    });

    return {
      success: true,
      deletedRoom,
    };
  }

  // Вимога 4: Фільтрація з кількома умовами (WHERE AND)
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
    }
    else if (minCapacity !== undefined) {
      where.capacity = { gte: minCapacity };
    }
    else if (maxCapacity !== undefined) {
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

  async updateRoomCapacity(roomId: number, newCapacity: number) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { room_id: roomId },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const oldCapacity = room.capacity;

      if (newCapacity < 1 || newCapacity > 200) {
        throw new Error("Room capacity must be between 1 and 200");
      }

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
          s => s._count.attendance > newCapacity,
        );

        if (hasConflicts) {
          throw new Error(
            `Cannot reduce capacity to ${newCapacity}: some future sessions already have more bookings`,
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
        throw new Error(
          "Room capacity was changed by another admin. Please refresh and try again",
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
}
