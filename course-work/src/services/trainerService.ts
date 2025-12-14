import { TrainersRepository } from "../repositories/trainerRepository";
import { CreateTrainerInput, UpdateTrainerInput } from "../schemas/trainerSchema";

export const TrainersService = {
  async getAllTrainers() {
    return await TrainersRepository.findAll();
  },

  async getTrainerById(id: number) {
    const trainer = await TrainersRepository.findById(id);
    if (!trainer) throw new Error("Trainer not found");
    return trainer;
  },

  async createTrainer(data: CreateTrainerInput) {
    const existing = await TrainersRepository.findContactByEmail(data.email);
    if (existing) throw new Error("Email already exists");

    if (data.gym_ids?.length) {
      const count = await TrainersRepository.countGyms(data.gym_ids);
      if (count !== data.gym_ids.length) throw new Error("One or more Gym IDs are invalid");
    }

    if (data.class_type_ids?.length) {
      const count = await TrainersRepository.countClassTypes(data.class_type_ids);
      if (count !== data.class_type_ids.length) throw new Error("One or more Class Type IDs are invalid");
    }

    return await TrainersRepository.create(data);
  },

  async updateTrainer(id: number, data: UpdateTrainerInput) {
    const trainer = await TrainersRepository.findById(id);
    if (!trainer) throw new Error("Trainer not found");

    if (data.email && data.email !== trainer.contact_data.email) {
      const existing = await TrainersRepository.findContactByEmail(data.email);
      if (existing) throw new Error("Email already exists");
    }

    return await TrainersRepository.update(id, data, trainer.contact_data_id);
  },

  async deleteTrainer(id: number) {
    const trainer = await TrainersRepository.findById(id);
    if (!trainer) throw new Error("Trainer not found");

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
    if(!trainer) throw new Error("Trainer not found");
    return await TrainersRepository.getSessionsByTrainer(id);
  }
};