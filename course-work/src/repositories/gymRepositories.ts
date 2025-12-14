import type { PrismaClient, Prisma } from "@prisma/client";
import type { IGymRepository, IRoomRepository } from "../interfaces/entitiesInterfaces";
import { softDeleteRoom } from "./sharedRepositoryFunc";

export class GymRepository implements IGymRepository {
  constructor(private prisma: PrismaClient) {}

  async create(address: string) {
    return await this.prisma.gym.create({
      data: { address },
    });
  }

  async findById(gymId: number) {
    return await this.prisma.gym.findFirst({
      where: { gym_id: gymId, is_deleted: false },
      include: {
        _count: {
          select: {
            room: true,
            trainer_placement: true,
          },
        },
      },
    });
  }

  async findAll(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    const { includeStats = true, limit, offset } = options;

    const [gyms, total] = await Promise.all([
      this.prisma.gym.findMany({
        where: { is_deleted: false },
        include: includeStats
          ? {
              _count: { select: { room: true, trainer_placement: true } },
            }
          : undefined,
        orderBy: { gym_id: "asc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.gym.count({ where: { is_deleted: false } }),
    ]);

    return { gyms, total };
  }

  async delete(gymId: number) {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const gym = await tx.gym.update({
        where: { gym_id: gymId },
        data: { is_deleted: true },
      });

      const rooms = await tx.room.findMany({ where: { gym_id: gymId } });
      for (const room of rooms) {
        await softDeleteRoom(tx, room.room_id);
      }

      await tx.trainer_placement.updateMany({
        where: { gym_id: gymId },
        data: { is_deleted: true },
      });

      return gym;
    });
  }
  
  async searchByAddress(searchTerm: string, options: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = options;

    const [gyms, total] = await Promise.all([
      this.prisma.gym.findMany({
        where: {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        include: {
          _count: { select: { room: true, trainer_placement: true } },
        },
        orderBy: { address: "asc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.gym.count({
        where: {
          address: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      }),
    ]);

    return { gyms, total };
  }

  async findGymsWithUtilizationData() {
    return await this.prisma.gym.findMany({
      include: {
        room: {
          include: {
            room_class_type: {
              include: {
                class_session: {
                  include: {
                    attendance: {
                      where: {
                        status: { in: ["attended", "booked"] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async createGymWithRoomsAndTrainers(data: {
    address: string;
    rooms?: { capacity: number; classTypeIds: number[]; }[];
    trainerIds?: number[];
  }) {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const gym = await tx.gym.create({
        data: { address: data.address },
      });

      if (data.rooms && data.rooms.length > 0) {
        for (const roomData of data.rooms) {
          const room = await tx.room.create({
            data: {
              gym_id: gym.gym_id,
              capacity: roomData.capacity,
            },
          });

          if (roomData.classTypeIds && roomData.classTypeIds.length > 0) {
            for (const classTypeId of roomData.classTypeIds) {
              await tx.room_class_type.create({
                data: {
                  room_id: room.room_id,
                  class_type_id: classTypeId,
                },
              });
            }
          }
        }
      }

      if (data.trainerIds && data.trainerIds.length > 0) {
        for (const trainerId of data.trainerIds) {
          await tx.trainer_placement.create({
            data: {
              trainer_id: trainerId,
              gym_id: gym.gym_id,
            },
          });
        }
      }

      return await tx.gym.findUnique({
        where: { gym_id: gym.gym_id },
        include: {
          room: {
            include: {
              room_class_type: {
                include: { class_type: true },
              },
            },
          },
          trainer_placement: {
            include: {
              trainer: { include: { contact_data: true } },
            },
          },
          _count: { select: { room: true, trainer_placement: true } },
        },
      });
    });
  }

  async findRoomsByGymId(gymId: number) {
    return await this.prisma.room.findMany({
      where: { gym_id: gymId },
      include: {
        room_class_type: {
          include: {
            class_type: true,
            _count: { select: { class_session: true } },
          },
        },
      },
    });
  }

  async findTrainersByGymId(gymId: number) {
    const trainers = await this.prisma.trainer_placement.findMany({
      where: { gym_id: gymId },
      include: { trainer: { include: { contact_data: true } } },
    });
    return trainers.map((tp: any) => tp.trainer);
  }
}
