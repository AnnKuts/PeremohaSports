import type { PrismaClient } from "@prisma/client";

export class GymService {
  constructor(private prisma: PrismaClient) {}

  async createGym(data: {
    address: string;
    rooms?: {
      capacity: number;
      classTypeIds: number[];
    }[];
    trainerIds?: number[];
  }) {
    return await this.prisma.$transaction(async (tx) => {
      const gym = await tx.gym.create({
        data: { address: data.address },
      });

      const summary = {
        roomsCreated: 0,
        trainersAssigned: 0,
        totalClassTypes: 0,
      };

      if (data.rooms && data.rooms.length > 0) {
        for (let i = 0; i < data.rooms.length; i++) {
          const roomData = data.rooms[i];

          if (roomData.capacity < 1 || roomData.capacity > 200) {
            throw new Error(`Room ${i + 1} capacity must be between 1 and 200`);
          }

          const room = await tx.room.create({
            data: {
              gym_id: gym.gym_id,
              capacity: roomData.capacity,
            },
          });

          if (roomData.classTypeIds && roomData.classTypeIds.length > 0) {
            for (const classTypeId of roomData.classTypeIds) {
              const classType = await tx.class_type.findUnique({
                where: { class_type_id: classTypeId },
              });
              if (!classType) {
                throw new Error(`Class type with ID ${classTypeId} not found`);
              }

              await tx.room_class_type.create({
                data: {
                  room_id: room.room_id,
                  class_type_id: classTypeId,
                },
              });
            }
          }
        }

        summary.roomsCreated = data.rooms.length;
        summary.totalClassTypes = [
          ...new Set(data.rooms.flatMap(r => r.classTypeIds || [])),
        ].length;
      }

      if (data.trainerIds && data.trainerIds.length > 0) {
        for (const trainerId of data.trainerIds) {
          const trainer = await tx.trainer.findUnique({
            where: { trainer_id: trainerId },
          });
          if (!trainer) {
            throw new Error(`Trainer with ID ${trainerId} not found`);
          }

          const existingPlacement = await tx.trainer_placement.findUnique({
            where: {
              trainer_id_gym_id: {
                trainer_id: trainerId,
                gym_id: gym.gym_id,
              },
            },
          });

          if (existingPlacement) {
            throw new Error(`Trainer ${trainerId} already works in this gym`);
          }

          await tx.trainer_placement.create({
            data: {
              trainer_id: trainerId,
              gym_id: gym.gym_id,
            },
          });
        }

        summary.trainersAssigned = data.trainerIds.length;
      }

      const completeGym = await tx.gym.findUnique({
        where: { gym_id: gym.gym_id },
        include: {
          room: {
            include: {
              room_class_type: {
                include: {
                  class_type: true,
                },
              },
            },
          },
          trainer_placement: {
            include: {
              trainer: {
                include: {
                  contact_data: true,
                },
              },
            },
          },
          _count: { select: { room: true, trainer_placement: true } },
        },
      });

      const isSimpleCreation = !data.rooms && !data.trainerIds;

      return {
        success: true,
        gym: completeGym,
        summary,
        creationType: isSimpleCreation ? "simple" : "complete",
      };
    });
  }

  async getAllGyms(
    options: { includeStats?: boolean; limit?: number; offset?: number } = {},
  ) {
    const { includeStats = true, limit, offset } = options;

    const [gyms, total] = await Promise.all([
      this.prisma.gym.findMany({
        include: includeStats
          ? {
              _count: { select: { room: true, trainer_placement: true } },
            }
          : undefined,
        orderBy: { gym_id: "asc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.gym.count(),
    ]);

    return { gyms, total };
  }

  async getGymById(gymId: number) {
    return await this.prisma.gym.findUnique({
      where: { gym_id: gymId },
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

  async getGymRooms(gymId: number) {
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

  async getGymTrainers(gymId: number) {
    const trainers = await this.prisma.trainer_placement.findMany({
      where: { gym_id: gymId },
      include: { trainer: { include: { contact_data: true } } },
    });
    return trainers.map(tp => tp.trainer);
  }

  async deleteGym(gymId: number) {
    const gym = await this.prisma.gym.findUnique({
      where: { gym_id: gymId },
    });

    if (!gym) {
      throw new Error("Gym not found");
    }

    const deletedGym = await this.prisma.gym.delete({
      where: { gym_id: gymId },
    });

    return {
      success: true,
      deletedGym,
    };
  }

  async searchGymsByAddress(searchTerm: string, options: { limit?: number; offset?: number } = {}) {
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

  // OLAP??
  async getGymUtilizationAnalysis() {
    const gyms = await this.prisma.gym.findMany({
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

    return gyms
      .filter(gym => gym.room.length > 0)
      .map((gym) => {
        const rooms = gym.room;

        const totalRooms = rooms.length;

        const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

        const sessions = rooms.flatMap(r =>
          r.room_class_type.flatMap(rct => rct.class_session),
        );

        const totalSessions = sessions.length;

        const avgSessionCapacity = totalSessions > 0
          ? sessions.reduce((sum, s) => sum + s.capacity, 0) / totalSessions
          : 0;

        const totalBookings = sessions.reduce((sum, s) => sum + s.attendance.length, 0);

        const totalSessionCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);

        const utilizationRate = totalSessionCapacity > 0
          ? (totalBookings / totalSessionCapacity) * 100
          : 0;

        const avgSessionsPerRoom = totalSessions / totalRooms;

        return {
          gym_id: gym.gym_id,
          gym_address: gym.address,
          total_rooms: totalRooms,
          total_capacity: totalCapacity,
          total_sessions: totalSessions,
          avg_session_capacity: Number(avgSessionCapacity.toFixed(2)),
          total_bookings: totalBookings,
          utilization_rate: Number(utilizationRate.toFixed(2)),
          avg_sessions_per_room: Number(avgSessionsPerRoom.toFixed(2)),
        };
      })
      .sort((a, b) => b.utilization_rate - a.utilization_rate);
  }
}
