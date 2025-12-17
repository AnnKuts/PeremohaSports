import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassTypeService } from "../../src/services/classTypes.service";

describe("ClassTypeService (unit)", () => {
  let mockRepo: any;
  let service: ClassTypeService;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(async (data) => ({ id: 1, ...data })),
      findAll: vi.fn(async () => ({ classTypes: [], total: 0 })),
      findById: vi.fn(async (id) => (id === 1 ? { id, name: "Yoga" } : null)),
      getTrainers: vi.fn(async (id) => [{ id: 1, name: "Trainer" }]),
      update: vi.fn(async (id, data) => ({ id, ...data })),
      delete: vi.fn(async (id) => ({ id, is_deleted: true })),
      getMonthlyRevenueByClassType: vi.fn(),
    };
    service = new ClassTypeService(mockRepo);
  });

  it("createClassType: creates a class type", async () => {
    const data = { name: "Yoga", description: "desc", level: "beginner" };
    const result = await service.createClassType(data);
    expect(result).toHaveProperty("id", 1);
    expect(mockRepo.create).toHaveBeenCalledWith(data);
  });

  it("getAllClassTypes: returns empty array", async () => {
    const result = await service.getAllClassTypes();
    expect(result).toEqual({ classTypes: [], total: 0 });
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it("getClassTypeById: returns class type if found", async () => {
    const result = await service.getClassTypeById(1);
    expect(result).toEqual({ id: 1, name: "Yoga" });
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });

  it("getClassTypeById: returns null if not found", async () => {
    const result = await service.getClassTypeById(999);
    expect(result).toBeNull();
  });

  it("getClassTypeTrainers: returns trainers", async () => {
    const result = await service.getClassTypeTrainers(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("name", "Trainer");
    expect(mockRepo.getTrainers).toHaveBeenCalledWith(1);
  });

  it("updateClassType: updates class type", async () => {
    const result = await service.updateClassType(1, { name: "Pilates" });
    expect(result).toEqual({ id: 1, name: "Pilates" });
    expect(mockRepo.update).toHaveBeenCalledWith(1, { name: "Pilates" });
  });

  it("updateClassType: returns null if not found", async () => {
    mockRepo.update.mockResolvedValueOnce(null);
    const result = await service.updateClassType(999, { name: "yoga" });
    expect(result).toBeNull();
  });

  it("getClassTypeTrainers: returns empty array", async () => {
    mockRepo.getTrainers.mockResolvedValueOnce([]);
    const result = await service.getClassTypeTrainers(1);
    expect(result).toEqual([]);
  });
  
  it("DeleteClassType: soft/cascade deletes class type and related", async () => {
    const result = await service.DeleteClassType(1);
    expect(result).toEqual({ id: 1, is_deleted: true });
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  describe("getMonthlyRevenueByClassType", () => {
    beforeEach(() => {
      mockRepo.getMonthlyRevenueByClassType.mockReset();
    });

    it("should call repository with default params", async () => {
      mockRepo.getMonthlyRevenueByClassType.mockResolvedValue([]);
      await service.getMonthlyRevenueByClassType();
      expect(mockRepo.getMonthlyRevenueByClassType).toHaveBeenCalledWith({});
    });

    it("should pass query params to repository", async () => {
      mockRepo.getMonthlyRevenueByClassType.mockResolvedValue([]);
      const params = { minRevenue: 100, minAttendance: 2, months: 3 };
      await service.getMonthlyRevenueByClassType(params);
      expect(mockRepo.getMonthlyRevenueByClassType).toHaveBeenCalledWith(params);
    });

    it("should return repository result", async () => {
      const fakeResult = [{ class_category: "yoga", month: "2025-12", attendance_count: 5, total_revenue: "1000.00" }];
      mockRepo.getMonthlyRevenueByClassType.mockResolvedValue(fakeResult);
      const result = await service.getMonthlyRevenueByClassType();
      expect(result).toBe(fakeResult);
    });
  });
});
