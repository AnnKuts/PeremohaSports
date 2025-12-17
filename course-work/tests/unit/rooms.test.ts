import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoomService } from "../../src/services/roomServices";
import AppError from "../../src/utils/AppError";

describe("RoomService (unit)", () => {
  let mockRepo: any;
  let service: RoomService;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(async (data) => ({ id: 1, ...data })),
      findAll: vi.fn(async (opts) => ({ rooms: [], total: 0 })),
      findById: vi.fn(async (id) => (id === 1 ? { id } : null)),
      delete: vi.fn(async (id) => ({ id })),
      findClassTypesByRoomId: vi.fn(async (id) => [{ id: 1, name: "Yoga" }]),
      findSessionsByRoomId: vi.fn(async (id) => [{ id: 1, date: "2025-12-14" }]),
      createRoomClassType: vi.fn(async (roomId, classTypeId) => ({ roomId, classTypeId })),
      searchRooms: vi.fn(async (filters) => ({ rooms: [], total: 0 })),
      updateCapacity: vi.fn(async (roomId, newCapacity) => ({ roomId, newCapacity })),
    };
    service = new RoomService(mockRepo);
  });

  it("createRoom: creates a room", async () => {
    const data = { gym_id: 1, capacity: 10 };
    const result = await service.createRoom(data);
    expect(result).toHaveProperty("id", 1);
    expect(mockRepo.create).toHaveBeenCalledWith(data);
  });

  it("getAllRooms: returns empty array", async () => {
    const result = await service.getAllRooms();
    expect(result).toEqual({ rooms: [], total: 0 });
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it("getRoomById: returns room if found", async () => {
    const result = await service.getRoomById(1);
    expect(result).toEqual({ id: 1 });
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });

  it("getRoomById: returns null if not found", async () => {
    const result = await service.getRoomById(999);
    expect(result).toBeNull();
  });

  it("getRoomClassTypes: returns class types", async () => {
    const result = await service.getRoomClassTypes(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("name", "Yoga");
    expect(mockRepo.findClassTypesByRoomId).toHaveBeenCalledWith(1);
  });

  it("getRoomSessions: returns sessions", async () => {
    const result = await service.getRoomSessions(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("date");
    expect(mockRepo.findSessionsByRoomId).toHaveBeenCalledWith(1);
  });

  it("createRoomClassType: associates class type", async () => {
    const result = await service.createRoomClassType(1, 2);
    expect(result).toEqual({ roomId: 1, classTypeId: 2 });
    expect(mockRepo.createRoomClassType).toHaveBeenCalledWith(1, 2);
  });

  it("deleteRoom: deletes if found", async () => {
    const result = await service.deleteRoom(1);
    expect(result.success).toBe(true);
    expect(result.deletedRoom.id).toBe(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it("deleteRoom: throws if not found", async () => {
    await expect(service.deleteRoom(999)).rejects.toThrow(AppError);
  });

  it("searchRooms: passes filters to repo", async () => {
    await service.searchRooms({ gymId: 1, minCapacity: 5 });
    expect(mockRepo.searchRooms).toHaveBeenCalledWith({ gymId: 1, minCapacity: 5 });
  });

  it("updateRoomCapacity: updates if valid", async () => {
    const result = await service.updateRoomCapacity(1, 50);
    expect(result).toEqual({ roomId: 1, newCapacity: 50 });
    expect(mockRepo.updateCapacity).toHaveBeenCalledWith(1, 50);
  });

  it("updateRoomCapacity: throws if < 1", async () => {
    await expect(service.updateRoomCapacity(1, 0)).rejects.toThrow(AppError);
    expect(mockRepo.updateCapacity).not.toHaveBeenCalled();
  });

  it("updateRoomCapacity: throws if > 200", async () => {
    await expect(service.updateRoomCapacity(1, 201)).rejects.toThrow(AppError);
    expect(mockRepo.updateCapacity).not.toHaveBeenCalled();
  });

  it("updateRoomCapacity: throws if future sessions exceed new capacity", async () => {
    mockRepo.updateCapacity.mockRejectedValue(new Error("Cannot reduce capacity"));
    await expect(service.updateRoomCapacity(1, 5)).rejects.toThrow("Cannot reduce capacity");
    expect(mockRepo.updateCapacity).toHaveBeenCalledWith(1, 5);
  });

  describe("getRoomRevenueAndAttendance", () => {
    beforeEach(() => {
      mockRepo.getRoomRevenueAndAttendance = vi.fn();
    });

    it("should call repository and return result", async () => {
      const fakeResult = [
        { gym_id: 1, gym_address: "вул. Шевченка 10", room_id: 2, room_capacity: 20, attendance_count: 5, total_revenue: "1000.00" },
      ];
      mockRepo.getRoomRevenueAndAttendance.mockResolvedValue(fakeResult);
      const result = await service.getRoomRevenueAndAttendance();
      expect(result).toBe(fakeResult);
      expect(mockRepo.getRoomRevenueAndAttendance).toHaveBeenCalled();
    });
  });
});
