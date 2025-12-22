import prisma from '../lib/prisma';
import AppError from '../utils/AppError';
import { CreateSessionInput } from '../schemas/session.schema';

export const SessionsRepository = {
  async findAll() {
    return prisma.class_session.findMany({
      where: { is_deleted: false },
      take: 100,
      orderBy: { date: 'desc' },
      include: {
        trainer: { select: { first_name: true, last_name: true } },
        room_class_type: { include: { class_type: true, room: true } }
      }
    });
  },

  async findById(id: number) {
    return prisma.class_session.findFirst({
      where: {
        session_id: id,
        is_deleted: false
      },
      include: {
        trainer: { select: { first_name: true, last_name: true } },
        room_class_type: { include: { class_type: true, room: true } },
        attendance: true
      }
    });
  },

  async create(data: CreateSessionInput) {
    const { trainer_id, room_id, class_type_id, date, duration, capacity } = data;

    return prisma.$transaction(async (tx) => {
      const roomClassSupport = await tx.room_class_type.findUnique({
        where: {
          room_id_class_type_id: {
            room_id: room_id,
            class_type_id: class_type_id
          }
        },
        include: { room: true }
      });

      if (!roomClassSupport) {
        throw new AppError('Room does not support this class type', 400);
      }

      const qualification = await tx.qualification.findUnique({
        where: {
          trainer_id_class_type_id: {
            trainer_id: trainer_id,
            class_type_id: class_type_id
          }
        }
      });

      if (!qualification) {
        throw new AppError('Trainer is not qualified for this class type', 400);
      }

      const placement = await tx.trainer_placement.findUnique({
        where: {
          trainer_id_gym_id: {
            trainer_id: trainer_id,
            gym_id: roomClassSupport.room.gym_id
          }
        }
      });

      if (!placement) {
        throw new AppError('Trainer is not assigned to the gym where this room is located', 400);
      }

      const newSession = await tx.class_session.create({
        data: {
          trainer_id,
          room_id,
          class_type_id,
          date,
          duration: duration as any,
          capacity
        }
      });

      return newSession;
    });
  },

  async softDelete(id: number) {
    return prisma.class_session.update({
      where: { session_id: id },
      data: { is_deleted: true }
    });
  }
};
