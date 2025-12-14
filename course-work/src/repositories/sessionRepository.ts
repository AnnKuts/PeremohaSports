import prisma from "../lib/prisma";

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

  async softDelete(id: number) {
    return prisma.class_session.update({
      where: { session_id: id },
      data: { is_deleted: true }
    });
  }
};