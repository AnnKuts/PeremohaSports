import AppError from '../utils/AppError';
import { SessionsRepository } from '../repositories/session.repository';
import { CreateSessionInput } from '../schemas/session.schema';
import { TrainerJwtPayload } from '../middlewares/authenticate';

export const SessionsService = {
  async getAllSessions() {
    return await SessionsRepository.findAll();
  },

  async getSessionById(id: number) {
    const session = await SessionsRepository.findById(id);
    if (!session) throw new AppError('Session not found', 404);
    return session;
  },

  async createSession(data: CreateSessionInput, user: TrainerJwtPayload) {
    if (!user.isAdmin) {
      if (data.trainer_id !== user.trainerId) {
        throw new AppError('You can only create sessions for yourself', 403);
      }
    }

    return await SessionsRepository.create(data);
  },

  async deleteSession(id: number) {
    const session = await SessionsRepository.findById(id);
    if (!session) throw new AppError('Session not found', 404);

    return await SessionsRepository.softDelete(id);
  }
};
