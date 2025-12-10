import { PrismaClient } from '@prisma/client';

export type CreateGymData = {
  address: string;
};

export class GymService {
  constructor(private prisma: PrismaClient) {}

  async createGym(data: CreateGymData) {
    return await this.prisma.gym.create({
      data: { address: data.address },
      include: { _count: { select: { room: true, trainer_placement: true } } },
    });
  }

  async getAllGyms(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
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
    console.log('Service: Starting hard delete for gym ID:', gymId);
    
    const gymWithStats = await this.prisma.gym.findUnique({
      where: { gym_id: gymId },
      include: {
        _count: {
          select: {
            room: true,
            trainer_placement: true
          }
        }
      }
    });

    if (!gymWithStats) {
      throw new Error('Gym not found');
    }

    const deletedGym = await this.prisma.gym.delete({
      where: { gym_id: gymId }
    });

    console.log('Service: Gym deleted successfully with CASCADE');
    console.log(`Deleted gym: "${deletedGym.address}"`);

    return {
      success: true,
      deletedGym,
      statistics: {
        rooms: gymWithStats._count.room,
        trainerPlacements: gymWithStats._count.trainer_placement,
      }
    };
  }


}
