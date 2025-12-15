import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassTypeService } from "../../src/services/classTypesServices";

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
});
