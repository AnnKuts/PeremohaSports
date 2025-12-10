import type { PrismaClient } from "@prisma/client";

export type CreateRoomData = {
  capacity: number;
  gym_id: number;
};

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
}
