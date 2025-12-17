import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionsService } from "../../src/services/session.service";
import { SessionsRepository } from "../../src/repositories/session.repository";
import AppError from "../../src/utils/AppError";

vi.mock("../../src/repositories/session.repository");

describe("SessionsService (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // describe("createSession", () => {
  //   const sessionData = {
  //     trainer_id: 5,
  //     room_id: 1,
  //     class_type_id: 1,
  //     date: new Date(),
  //     duration: "01:00:00",
  //     capacity: 10
  //   };

  //   it("allows Admin to create session for anyone", async () => {
  //     const adminUser = { actor: "trainer", trainerId: 1, email: "admin", isAdmin: true } as any;


  //     vi.mocked(SessionsRepository.create).mockResolvedValue({ session_id: 100, ...sessionData } as any);

  //     const result = await SessionsService.createSession(sessionData, adminUser);

  //     expect(result).toHaveProperty("session_id", 100);
  //     expect(SessionsRepository.create).toHaveBeenCalledWith(sessionData);
  //   });

  //   it("allows Trainer to create session for THEMSELVES", async () => {

  //     const trainerUser = { actor: "trainer", trainerId: 5, email: "me", isAdmin: false } as any;

  //     vi.mocked(SessionsRepository.create).mockResolvedValue({ session_id: 101, ...sessionData } as any);

  //     const result = await SessionsService.createSession(sessionData, trainerUser);

  //     expect(result).toHaveProperty("session_id", 101);
  //   });

  //   it("throws 403 if Trainer creates session for SOMEONE ELSE", async () => {

  //     const trainerUser = { actor: "trainer", trainerId: 5, email: "me", isAdmin: false } as any;
  //     const otherData = { ...sessionData, trainer_id: 99 };

  //     await expect(SessionsService.createSession(otherData, trainerUser))
  //       .rejects.toThrow("You can only create sessions for yourself");


  //     expect(SessionsRepository.create).not.toHaveBeenCalled();
  //   });
  // });

  describe("getSessionById", () => {
    it("returns session if found", async () => {
      vi.mocked(SessionsRepository.findById).mockResolvedValue({ session_id: 1 } as any);
      const result = await SessionsService.getSessionById(1);
      expect(result).toEqual({ session_id: 1 });
    });

    it("throws 404 if not found", async () => {
      vi.mocked(SessionsRepository.findById).mockResolvedValue(null);
      await expect(SessionsService.getSessionById(99)).rejects.toThrow(AppError);
    });
  });

  // describe("deleteSession", () => {
  //   it("soft deletes session", async () => {
  //     vi.mocked(SessionsRepository.findById).mockResolvedValue({ session_id: 1 } as any);
  //     vi.mocked(SessionsRepository.softDelete).mockResolvedValue({ session_id: 1, is_deleted: true } as any);

  //     const result = await SessionsService.deleteSession(1);
  //     expect(result.is_deleted).toBe(true);
  //   });

  //   it("throws 404 if session not found", async () => {
  //     vi.mocked(SessionsRepository.findById).mockResolvedValue(null);
  //     await expect(SessionsService.deleteSession(99)).rejects.toThrow("Session not found");
  //   });
  // });
});