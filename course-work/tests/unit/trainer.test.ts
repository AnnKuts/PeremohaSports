import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TrainersService } from "../../src/services/trainerService";
import { TrainersRepository } from "../../src/repositories/trainerRepository";
import AppError from "../../src/utils/AppError";

vi.mock("../../src/repositories/trainerRepository");

describe("TrainersService (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTrainers", () => {
    it("returns array of trainers", async () => {
      vi.mocked(TrainersRepository.findAll).mockResolvedValue([{ trainer_id: 1, first_name: "John" }] as any);

      const result = await TrainersService.getAllTrainers();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("first_name", "John");
      expect(TrainersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("getTrainerById", () => {
    it("returns trainer if found", async () => {
      vi.mocked(TrainersRepository.findById).mockResolvedValue({ trainer_id: 1, first_name: "John" } as any);

      const result = await TrainersService.getTrainerById(1);
      expect(result).toEqual({ trainer_id: 1, first_name: "John" });
    });

    it("throws AppError(404) if not found", async () => {
      vi.mocked(TrainersRepository.findById).mockResolvedValue(null);

      await expect(TrainersService.getTrainerById(999)).rejects.toThrow(AppError);
      await expect(TrainersService.getTrainerById(999)).rejects.toThrow("Trainer not found");
    });
  });

  describe("createTrainer", () => {
    const newTrainerData = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@test.com",
      phone: "123456789",
      is_admin: false,
      gym_ids: [1],
      class_type_ids: [2]
    };

    it("creates trainer successfully", async () => {
      
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue(null);
      
      vi.mocked(TrainersRepository.countGyms).mockResolvedValue(1);
      
      vi.mocked(TrainersRepository.countClassTypes).mockResolvedValue(1);
      
      vi.mocked(TrainersRepository.create).mockResolvedValue({ trainer_id: 2, ...newTrainerData } as any);

      const result = await TrainersService.createTrainer(newTrainerData);

      expect(result).toHaveProperty("trainer_id", 2);
      expect(TrainersRepository.create).toHaveBeenCalledWith(newTrainerData);
    });

    it("throws error if email already exists", async () => {
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue({ contact_data_id: 1 } as any);

      await expect(TrainersService.createTrainer(newTrainerData)).rejects.toThrow("Email already exists");
      expect(TrainersRepository.create).not.toHaveBeenCalled();
    });

    it("throws error if gym ids are invalid", async () => {
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue(null);
      vi.mocked(TrainersRepository.countGyms).mockResolvedValue(0); 

      await expect(TrainersService.createTrainer(newTrainerData)).rejects.toThrow("One or more Gym IDs are invalid");
    });
  });

  describe("updateTrainer", () => {
    const updateData = { first_name: "Updated", email: "new@test.com" };

    it("updates trainer successfully", async () => {
      
      vi.mocked(TrainersRepository.findById).mockResolvedValue({ 
        trainer_id: 1, 
        contact_data: { email: "old@test.com" }, 
        contact_data_id: 10 
      } as any);
      
      
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue(null);
      
      
      vi.mocked(TrainersRepository.update).mockResolvedValue({ trainer_id: 1, first_name: "Updated" } as any);

      const result = await TrainersService.updateTrainer(1, updateData);
      expect(result).toHaveProperty("first_name", "Updated");
      expect(TrainersRepository.update).toHaveBeenCalledWith(1, updateData, 10);
    });

    it("throws error if trainer not found", async () => {
      vi.mocked(TrainersRepository.findById).mockResolvedValue(null);
      await expect(TrainersService.updateTrainer(999, updateData)).rejects.toThrow("Trainer not found");
    });
  });

  describe("deleteTrainer", () => {
    it("soft deletes trainer", async () => {
      vi.mocked(TrainersRepository.findById).mockResolvedValue({ trainer_id: 1 } as any);
      vi.mocked(TrainersRepository.softDelete).mockResolvedValue({ trainer_id: 1, is_deleted: true } as any);

      const result = await TrainersService.deleteTrainer(1);
      expect(result.is_deleted).toBe(true);
    });

    it("throws error if trainer not found", async () => {
      vi.mocked(TrainersRepository.findById).mockResolvedValue(null);
      await expect(TrainersService.deleteTrainer(999)).rejects.toThrow("Trainer not found");
    });
  });

  describe("getTopTrainer", () => {
    it("returns message if no stats found", async () => {
      vi.mocked(TrainersRepository.getTopTrainerStats).mockResolvedValue([]);
      
      const result = await TrainersService.getTopTrainer();
      expect(result).toEqual({ message: "No sessions found in the last month" });
    });

    it("returns top trainer data", async () => {
      vi.mocked(TrainersRepository.getTopTrainerStats).mockResolvedValue([
        { trainer_id: 1, _count: { session_id: 10 } }
      ] as any);
      
      vi.mocked(TrainersRepository.findById).mockResolvedValue({
        trainer_id: 1,
        first_name: "Best",
        last_name: "Trainer",
        contact_data: { email: "best@test.com" }
      } as any);

      const result = await TrainersService.getTopTrainer();
      
      
      expect(result).toHaveProperty("sessions_count", 10);
      expect(result).toHaveProperty("trainer");
    });
  });
});