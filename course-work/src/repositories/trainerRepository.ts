import prisma from "../lib/prisma";
import { CreateTrainerInput, UpdateTrainerInput } from "../schemas/trainerSchema";

export const TrainersRepository = {
  async findAll() {
    return prisma.trainer.findMany({
      where: { is_deleted: false },
      include: { contact_data: true },
      orderBy: { trainer_id: 'asc' }
    });
  },

  async findById(id: number) {
    return prisma.trainer.findFirst({
      where: { trainer_id: id,
        is_deleted: false
       },
      include: {
        contact_data: true,
        trainer_placement: { include: { gym: true } },
        qualification: { include: { class_type: true } }
      },
    });
  },

  async findContactByEmail(email: string) {
    return prisma.contact_data.findUnique({ where: { email } });
  },

  async countGyms(ids: number[]) {
    return prisma.gym.count({ where: { gym_id: { in: ids } } });
  },

  async countClassTypes(ids: number[]) {
    return prisma.class_type.count({ where: { class_type_id: { in: ids } } });
  },

  async create(data: CreateTrainerInput) {
    const { first_name, last_name, is_admin, email, phone, gym_ids, class_type_ids } = data;

    return prisma.$transaction(async (tx) => {
      const newContact = await tx.contact_data.create({
        data: { email, phone },
      });

      const newTrainer = await tx.trainer.create({
        data: {
          first_name,
          last_name,
          is_admin,
          contact_data_id: newContact.contact_data_id,
        },
      });

      if (gym_ids && gym_ids.length > 0) {
        await tx.trainer_placement.createMany({
          data: gym_ids.map((gid) => ({ trainer_id: newTrainer.trainer_id, gym_id: gid })),
        });
      }

      if (class_type_ids && class_type_ids.length > 0) {
        await tx.qualification.createMany({
          data: class_type_ids.map((cid) => ({ trainer_id: newTrainer.trainer_id, class_type_id: cid })),
        });
      }

      return newTrainer;
    });
  },

  async update(id: number, data: UpdateTrainerInput, currentContactId: number) {
    const { first_name, last_name, email, phone, gym_ids, class_type_ids, is_deleted } = data;

    return prisma.$transaction(async (tx) => {
      if (email || phone) {
        await tx.contact_data.update({
          where: { contact_data_id: currentContactId },
          data: { email, phone },
        });
      }

      if (first_name || last_name || is_deleted !== undefined) {
        await tx.trainer.update({
          where: { trainer_id: id },
          data: { 
            first_name, 
            last_name,
            is_deleted 
          },
        });
      }

      if (gym_ids) {
        await tx.trainer_placement.deleteMany({ where: { trainer_id: id } });
        if (gym_ids.length > 0) {
          await tx.trainer_placement.createMany({
            data: gym_ids.map((gid) => ({ trainer_id: id, gym_id: gid })),
          });
        }
      }

      if (class_type_ids) {
        await tx.qualification.deleteMany({ where: { trainer_id: id } });
        if (class_type_ids.length > 0) {
          await tx.qualification.createMany({
            data: class_type_ids.map((cid) => ({ trainer_id: id, class_type_id: cid })),
          });
        }
      }
      return tx.trainer.findUnique({ where: { trainer_id: id } });
    });
  },

    async softDelete(id: number) {
    return prisma.trainer.update({
      where: { trainer_id: id },
      data: { is_deleted: true },
    });
  },

  async getSessionsByTrainer(trainerId: number) {
    return prisma.class_session.findMany({
      where: { trainer_id: trainerId },
      orderBy: { date: 'desc' }
    });
  },

  async getTopTrainerStats(oneMonthAgo: Date) {
    return prisma.class_session.groupBy({
      by: ["trainer_id"],
      where: { 
          date: { gte: oneMonthAgo },
          is_deleted: false 
      },
      _count: { session_id: true },
      orderBy: { _count: { session_id: "desc" } },
      take: 1,
    });
  },

   async getTrainersPopularity() {
    return prisma.trainer.findMany({
      where: { is_deleted: false },
      select: {
        trainer_id: true,
        first_name: true,
        last_name: true,
        class_session: {
          where: { is_deleted: false },
          select: {
            _count: {
              select: { 
                attendance: { 
                  where: { status: 'attended' }
                } 
              }
            }
          }
        }
      },
    });
  },

  async getTrainerWorkloadStats(trainerId: number) {
    return prisma.class_session.groupBy({
      by: ['class_type_id'],
      where: {
        trainer_id: trainerId,
        is_deleted: false
      },
      _count: {
        session_id: true
      },
      orderBy: {
        _count: {
          session_id: 'desc'
        }
      }
    });
  },

  async getClassTypesByIds(ids: number[]) {
    return prisma.class_type.findMany({
      where: { class_type_id: { in: ids } },
      select: { class_type_id: true, name: true }
    });
  }
};