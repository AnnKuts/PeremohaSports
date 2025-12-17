import { describe, it, expect, vi, beforeEach } from "vitest";
import { GymService } from "../../src/services/gym.service";
import AppError from "../../src/utils/AppError";

describe("GymService (unit)", () => {
	let mockRepo: any;
	let service: GymService;

	beforeEach(() => {
		mockRepo = {
			createGymWithRoomsAndTrainers: vi.fn(async (data) => ({ id: 1, ...data })),
			update: vi.fn(async (id, data) => ({ id, ...data })),
			findById: vi.fn(async (id) => (id === 1 ? { id } : null)),
			delete: vi.fn(async (id) => ({ id })),
			findGymsWithUtilizationData: vi.fn(async () => [
				{
					gym_id: 1,
					address: "Test",
					room: [
						{
							capacity: 10,
							room_class_type: [
								{ class_session: [
									{ capacity: 5, attendance: [1,2] },
									{ capacity: 5, attendance: [3] }
								] }
							]
						}
					]
				}
			]),
		};
		service = new GymService(mockRepo);
	});


		it("createGym: with rooms and trainers", async () => {
			const data = {
				address: "Test",
				rooms: [
					{ capacity: 10, classTypeIds: [1, 2] },
					{ capacity: 20, classTypeIds: [2, 3] }
				],
				trainerIds: [5, 6]
			};
			const result = await service.createGym(data);
			expect(result.success).toBe(true);
			expect(result.summary.roomsCreated).toBe(2);
			expect(result.summary.trainersAssigned).toBe(2);
			expect(result.summary.totalClassTypes).toBe(3);
			expect(result.creationType).toBe("complete");
		});

		it("createGym: throws if room capacity > 200", async () => {
			await expect(service.createGym({ address: "A", rooms: [{ capacity: 201, classTypeIds: [] }] }))
				.rejects.toThrow(AppError);
		});

		it("createGym: throws if room capacity < 1", async () => {
			await expect(service.createGym({ address: "A", rooms: [{ capacity: 0, classTypeIds: [] }] }))
				.rejects.toThrow(AppError);
		});

		it("updateGym: passes correct trimmed address", async () => {
			const result = await service.updateGym(1, { address: "  Gym  " });
			expect(result.address).toBe("Gym");
			expect(mockRepo.update).toHaveBeenCalledWith(1, { address: "Gym" });
		});

		it("updateGym: throws if address is not a string", async () => {
			// @ts-expect-error address is intentionally wrong type for test
			await expect(service.updateGym(1, { address: 123 })).rejects.toThrow(AppError);
		});

		it("deleteGym: returns correct structure", async () => {
			const result = await service.deleteGym(1);
			expect(result).toEqual({ success: true, deletedGym: { id: 1 } });
		});

		it("deleteGym: throws if gym not found (edge)", async () => {
			await expect(service.deleteGym(42)).rejects.toThrow("Gym not found");
		});

		it("getAllGyms: passes options to repo", async () => {
			mockRepo.findAll = vi.fn(async (opts) => ({ gyms: [], total: 0 }));
			await service.getAllGyms({ limit: 5, offset: 2 });
			expect(mockRepo.findAll).toHaveBeenCalledWith({ limit: 5, offset: 2 });
		});

		it("getGymById: returns gym if found", async () => {
			mockRepo.findById = vi.fn(async (id) => ({ id }));
			const result = await service.getGymById(1);
			expect(result).toEqual({ id: 1 });
		});

		it("getGymById: returns null if not found", async () => {
			mockRepo.findById = vi.fn(async (id) => null);
			const result = await service.getGymById(999);
			expect(result).toBeNull();
		});

		it("getGymUtilizationAnalysis: returns empty if no rooms", async () => {
			mockRepo.findGymsWithUtilizationData = vi.fn(async () => [{ gym_id: 2, address: "A", room: [] }]);
			const result = await service.getGymUtilizationAnalysis();
			expect(result).toEqual([]);
		});

	it("createGym: throws on invalid room capacity", async () => {
		await expect(service.createGym({ address: "A", rooms: [{ capacity: 0, classTypeIds: [] }] }))
			.rejects.toThrow(AppError);
	});

	it("updateGym: trims and updates address", async () => {
		const result = await service.updateGym(1, { address: "  New  " });
		expect(result.address).toBe("New");
		expect(mockRepo.update).toHaveBeenCalledWith(1, { address: "New" });
	});

	it("updateGym: throws if address is empty", async () => {
		await expect(service.updateGym(1, { address: "   " })).rejects.toThrow(AppError);
	});

	it("deleteGym: deletes if found", async () => {
		const result = await service.deleteGym(1);
		expect(result.success).toBe(true);
		expect(result.deletedGym.id).toBe(1);
	});

	it("deleteGym: throws if not found", async () => {
		await expect(service.deleteGym(999)).rejects.toThrow(AppError);
	});

	it("getGymUtilizationAnalysis: calculates utilization", async () => {
		const result = await service.getGymUtilizationAnalysis();
		expect(result[0].utilization_rate).toBeGreaterThan(0);
		expect(result[0].total_rooms).toBe(1);
	});
});
