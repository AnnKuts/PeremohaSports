import AppError from '../utils/AppError';
import { handlePrismaError } from '../utils/handlePrismaError';
import type { IGymRepository } from '../interfaces/entitiesInterfaces';

export class GymService {
  async updateGym(gymId: number, data: { address: string }) {
    if (!data.address || typeof data.address !== 'string' || !data.address.trim()) {
      throw new AppError('Address is required', 400);
    }
    try {
      return await this.gymRepository.update(gymId, { address: data.address.trim() });
    } catch (err: any) {
      throw handlePrismaError(err);
    }
  }
  constructor(private gymRepository: IGymRepository) {}

  async createGym(data: {
    address: string;
    rooms?: {
      capacity: number;
      classTypeIds: number[];
    }[];
    trainerIds?: number[];
  }) {
    if (data.rooms && data.rooms.length > 0) {
      for (let i = 0; i < data.rooms.length; i++) {
        const roomData = data.rooms[i];
        if (roomData.capacity < 1 || roomData.capacity > 200) {
          throw new AppError(`Room ${i + 1} capacity must be between 1 and 200`, 400);
        }
      }
    }

    try {
      const gym = await this.gymRepository.createGymWithRoomsAndTrainers(data);

      const summary = {
        roomsCreated: data.rooms?.length || 0,
        trainersAssigned: data.trainerIds?.length || 0,
        totalClassTypes: data.rooms
          ? [...new Set(data.rooms.flatMap((r: any) => r.classTypeIds || []))].length
          : 0
      };

      const isSimpleCreation = !data.rooms && !data.trainerIds;

      return {
        success: true,
        gym,
        summary,
        creationType: isSimpleCreation ? 'simple' : 'complete'
      };
    } catch (err: any) {
      throw handlePrismaError(err);
    }
  }

  async getAllGyms(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    return await this.gymRepository.findAll(options);
  }

  async getGymById(gymId: number) {
    return await this.gymRepository.findById(gymId);
  }

  async getGymRooms(gymId: number) {
    return await this.gymRepository.findRoomsByGymId(gymId);
  }

  async getGymTrainers(gymId: number) {
    return await this.gymRepository.findTrainersByGymId(gymId);
  }

  async deleteGym(gymId: number) {
    const gym = await this.gymRepository.findById(gymId);

    if (!gym) {
      throw new AppError('Gym not found', 404);
    }

    const deletedGym = await this.gymRepository.delete(gymId);

    return {
      success: true,
      deletedGym
    };
  }

  async searchGymsByAddress(searchTerm: string, options: { limit?: number; offset?: number } = {}) {
    return await this.gymRepository.searchByAddress(searchTerm, options);
  }

  async getGymUtilizationAnalysis() {
    const gyms = await this.gymRepository.findGymsWithUtilizationData();

    return gyms
      .filter((gym: any) => gym.room.length > 0)
      .map((gym: any) => {
        const rooms = gym.room;

        const totalRooms = rooms.length;

        const totalCapacity = rooms.reduce((sum: number, r: any) => sum + r.capacity, 0);

        const sessions = rooms.flatMap((r: any) =>
          r.room_class_type.flatMap((rct: any) => rct.class_session)
        );

        const totalSessions = sessions.length;

        const avgSessionCapacity =
          totalSessions > 0
            ? sessions.reduce((sum: number, s: any) => sum + s.capacity, 0) / totalSessions
            : 0;

        const totalBookings = sessions.reduce(
          (sum: number, s: any) => sum + s.attendance.length,
          0
        );

        const totalSessionCapacity = sessions.reduce((sum: number, s: any) => sum + s.capacity, 0);

        const utilizationRate =
          totalSessionCapacity > 0 ? (totalBookings / totalSessionCapacity) * 100 : 0;

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
          avg_sessions_per_room: Number(avgSessionsPerRoom.toFixed(2))
        };
      })
      .sort((a: any, b: any) => b.utilization_rate - a.utilization_rate);
  }
}
