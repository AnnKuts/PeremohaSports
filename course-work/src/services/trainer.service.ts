import AppError from "../utils/AppError";
import { TrainersRepository } from "../repositories/trainer.repository";
import { CreateTrainerInput, UpdateTrainerInput } from "../schemas/trainer.schema";

export const TrainersService = {
  async getAllTrainers() {
    return await TrainersRepository.findAll();
  },

  async getTrainerById(id: number) {
    const trainer = await TrainersRepository.findById(id);
    if (!trainer) throw new AppError("Trainer not found", 404);
    return trainer;
  },

  async createTrainer(data: CreateTrainerInput) {
    const existing = await TrainersRepository.findContactByEmail(data.email);
    if (existing) throw new AppError("Email already exists", 400);

    if (data.gym_ids?.length) {
      const count = await TrainersRepository.countGyms(data.gym_ids);
      if (count !== data.gym_ids.length) throw new AppError("One or more Gym IDs are invalid", 400);
    }

    if (data.class_type_ids?.length) {
      const count = await TrainersRepository.countClassTypes(data.class_type_ids);
      if (count !== data.class_type_ids.length) throw new AppError("One or more Class Type IDs are invalid", 400);
    }

    return await TrainersRepository.create(data);
  },

  async updateTrainer(id: number, data: UpdateTrainerInput) {
    const trainer = await TrainersRepository.findById(id);
    if (!trainer) throw new AppError("Trainer not found", 404);

    if (data.email && data.email !== trainer.contact_data.email) {
      const existing = await TrainersRepository.findContactByEmail(data.email);
      if (existing) throw new AppError("Email already exists", 400);
    }

    return await TrainersRepository.update(id, data, trainer.contact_data_id);
  },

  async deleteTrainer(id: number) {
    const trainer = await TrainersRepository.findById(id);
    if (!trainer) throw new AppError("Trainer not found", 404);

    return await TrainersRepository.softDelete(id);
  },

  async getTrainerGyms(id: number) {
    const trainer = await this.getTrainerById(id);
    return trainer.trainer_placement.map(p => p.gym);
  },

  async getTrainerQualifications(id: number) {
    const trainer = await this.getTrainerById(id);
    return trainer.qualification.map(q => q.class_type);
  },

  async getTrainerSessions(id: number) {
    const trainer = await TrainersRepository.findById(id);
    if(!trainer) throw new AppError("Trainer not found", 404);
    return await TrainersRepository.getSessionsByTrainer(id);
  },

  async getTopTrainer() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const stats = await TrainersRepository.getTopTrainerStats(oneMonthAgo);

    if (!stats.length) return { message: "No sessions found in the last month" };

    const topTrainerId = stats[0].trainer_id;
    const count = stats[0]._count.session_id;

    const trainer = await TrainersRepository.findById(topTrainerId);

    return {
      trainer: {
        id: topTrainerId,
        name: trainer ? `${trainer.first_name} ${trainer.last_name}` : "Unknown/Deleted Trainer",
        email: trainer?.contact_data.email
      },
      sessions_count: count
    };
  },

  async getPopularTrainers() {
    const trainers = await TrainersRepository.getTrainersPopularity();

    const formatted = trainers.map(t => {
      const totalClients = t.class_session.reduce((sum, session) => {
        return sum + session._count.attendance;
      }, 0);

      return {
        id: t.trainer_id,
        name: `${t.first_name} ${t.last_name}`,
        total_clients_attended: totalClients
      };
    });

    return formatted.sort((a, b) => b.total_clients_attended - a.total_clients_attended);
  },

  async getTrainerWorkloadStats(trainerId: number) {
    const trainer = await TrainersRepository.findById(trainerId);
    if (!trainer) throw new Error("Trainer not found");

    const stats = await TrainersRepository.getTrainerWorkloadStats(trainerId);

    if (stats.length === 0) {
      return { 
        trainer: `${trainer.first_name} ${trainer.last_name}`, 
        stats: [], 
        message: "No sessions conducted yet" 
      };
    }

    const typeIds = stats.map(s => s.class_type_id);
    const typesInfo = await TrainersRepository.getClassTypesByIds(typeIds);

    const result = stats.map(stat => {
      const typeName = typesInfo.find(t => t.class_type_id === stat.class_type_id)?.name || "Unknown";
      return {
        class_type: typeName,
        sessions_count: stat._count.session_id
      };
    });

    return {
      trainer: `${trainer.first_name} ${trainer.last_name}`,
      stats: result
    };
  }
};