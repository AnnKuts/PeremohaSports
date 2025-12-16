import AppError from "../utils/AppError";
import { SessionsRepository } from "../repositories/sessionRepository";
import { CreateSessionInput } from "../schemas/sessionSchema";
import { TrainerJwtPayload } from "../middlewares/authenticate";

export const SessionsService = {
  async getAllSessions() {
    return await SessionsRepository.findAll();
  },

  async getSessionById(id: number) {
    const session = await SessionsRepository.findById(id);
    if (!session) throw new AppError("Session not found", 404);
    return session;
  },

  async createSession(data: CreateSessionInput, user: TrainerJwtPayload) {
    if (!user.isAdmin) {
      if (data.trainer_id !== user.trainerId) {
        throw new AppError("You can only create sessions for yourself", 403);
      }
    }

    return await SessionsRepository.create(data);
  },

   async deleteSession(id: number) {
    const session = await SessionsRepository.findById(id);
    if (!session) throw new AppError("Session not found", 404);

    return await SessionsRepository.softDelete(id);
  }
};