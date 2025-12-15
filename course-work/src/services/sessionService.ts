import AppError from "../utils/AppError";
import { SessionsRepository } from "../repositories/sessionRepository";

export const SessionsService = {
  async getAllSessions() {
    return await SessionsRepository.findAll();
  },

  async getSessionById(id: number) {
    const session = await SessionsRepository.findById(id);
    if (!session) throw new AppError("Session not found", 404);
    return session;
  }
};