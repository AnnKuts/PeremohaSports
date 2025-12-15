import AppError from "../utils/AppError";
import type { IRoomRepository } from "../interfaces/entitiesInterfaces";

export class RoomService {
  constructor(private roomRepository: IRoomRepository) {}

  async createRoom(data: any) {
    return await this.roomRepository.create(data);
  }

  async getAllRooms(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    return await this.roomRepository.findAll(options);
  }

  async getRoomById(roomId: number) {
    return await this.roomRepository.findById(roomId);
  }

  async getRoomClassTypes(roomId: number) {
    return await this.roomRepository.findClassTypesByRoomId(roomId);
  }

  async getRoomSessions(roomId: number) {
    return await this.roomRepository.findSessionsByRoomId(roomId);
  }

  async createRoomClassType(roomId: number, classTypeId: number) {
    return await this.roomRepository.createRoomClassType(roomId, classTypeId);
  }

  async deleteRoom(roomId: number) {
    const room = await this.roomRepository.findById(roomId);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const deletedRoom = await this.roomRepository.delete(roomId);

    return {
      success: true,
      deletedRoom,
    };
  }

  async searchRooms(filters: {
    minCapacity?: number;
    maxCapacity?: number;
    gymId?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    return await this.roomRepository.searchRooms(filters);
  }

  async updateRoomCapacity(roomId: number, newCapacity: number) {
    if (newCapacity < 1 || newCapacity > 200) {
      throw new AppError("Room capacity must be between 1 and 200", 400);
    }

    return await this.roomRepository.updateCapacity(roomId, newCapacity);
  }

  async getRoomRevenueAndAttendance() {
    return await this.roomRepository.getRoomRevenueAndAttendance();
  }
}
