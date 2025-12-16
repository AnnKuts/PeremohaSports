import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrainersService } from '../../src/services/trainerService';
import { TrainersRepository } from '../../src/repositories/trainerRepository';

// Мокаємо Репозиторій, щоб не звертатися до БД
vi.mock('../../src/repositories/trainerRepository', () => ({
  TrainersRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findContactByEmail: vi.fn(),
    countGyms: vi.fn(),
    countClassTypes: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    getTrainersPopularity: vi.fn(),
    getTrainerWorkloadStats: vi.fn(),
    getClassTypesByIds: vi.fn(),
    getSessionsByTrainer: vi.fn(),
  }
}));

describe('TrainersService Unit Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTrainer', () => {
    // 👇 ВИПРАВЛЕНО: Додано is_admin: false
    const validData = {
      first_name: "John",
      last_name: "Doe",
      email: "john@test.com",
      phone: "1234567890",
      is_admin: false, // <--- Це поле обов'язкове для типу, хоча в схемі воно default
      gym_ids: [1],
      class_type_ids: [1]
    };

    it('should create trainer successfully', async () => {
      // Налаштовуємо моки на успіх
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue(null);
      vi.mocked(TrainersRepository.countGyms).mockResolvedValue(1);
      vi.mocked(TrainersRepository.countClassTypes).mockResolvedValue(1);
      vi.mocked(TrainersRepository.create).mockResolvedValue({ trainer_id: 1, ...validData } as any);

      const result = await TrainersService.createTrainer(validData);

      expect(result).toBeDefined();
      expect(result.trainer_id).toBe(1);
      expect(TrainersRepository.create).toHaveBeenCalledWith(validData);
    });

    it('should throw error if email exists', async () => {
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue({ contact_data_id: 1 } as any);

      await expect(TrainersService.createTrainer(validData))
        .rejects.toThrow("Email already exists");
      
      expect(TrainersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if gym IDs are invalid', async () => {
      vi.mocked(TrainersRepository.findContactByEmail).mockResolvedValue(null);
      vi.mocked(TrainersRepository.countGyms).mockResolvedValue(0); // Знайдено 0 залів

      await expect(TrainersService.createTrainer(validData))
        .rejects.toThrow("One or more Gym IDs are invalid");
    });
  });

  describe('getPopularTrainers (Analytics)', () => {
    it('should calculate popularity and sort descending', async () => {
      // Сирі дані з репозиторію
      const mockRawData = [
        {
          trainer_id: 1,
          first_name: "Less",
          last_name: "Popular",
          class_session: [
            { _count: { attendance: 5 } },
            { _count: { attendance: 5 } }
          ] // Сума 10
        },
        {
          trainer_id: 2,
          first_name: "Most",
          last_name: "Popular",
          class_session: [
            { _count: { attendance: 20 } },
            { _count: { attendance: 30 } }
          ] // Сума 50
        }
      ];

      vi.mocked(TrainersRepository.getTrainersPopularity).mockResolvedValue(mockRawData as any);

      const result = await TrainersService.getPopularTrainers();

      // Перевіряємо сортування
      expect(result[0].name).toBe("Most Popular");
      expect(result[0].total_clients_attended).toBe(50);
      
      expect(result[1].name).toBe("Less Popular");
      expect(result[1].total_clients_attended).toBe(10);
    });
  });

  describe('getTrainerWorkloadStats', () => {
    it('should format stats correctly with class names', async () => {
      const trainerId = 1;
      
      // Мок тренера
      vi.mocked(TrainersRepository.findById).mockResolvedValue({ 
        trainer_id: 1, first_name: "Test", last_name: "Trainer" 
      } as any);

      // Мок статистики з БД (групування)
      const mockStats = [
        { class_type_id: 10, _count: { session_id: 5 } },
        { class_type_id: 20, _count: { session_id: 2 } }
      ];
      vi.mocked(TrainersRepository.getTrainerWorkloadStats).mockResolvedValue(mockStats as any);

      // Мок назв типів занять
      vi.mocked(TrainersRepository.getClassTypesByIds).mockResolvedValue([
        { class_type_id: 10, name: "Yoga" },
        { class_type_id: 20, name: "Boxing" }
      ] as any);

      const result = await TrainersService.getTrainerWorkloadStats(trainerId);

      expect(result.trainer).toBe("Test Trainer");
      expect(result.stats).toHaveLength(2);
      expect(result.stats[0]).toEqual({ class_type: "Yoga", sessions_count: 5 });
      expect(result.stats[1]).toEqual({ class_type: "Boxing", sessions_count: 2 });
    });
  });
});