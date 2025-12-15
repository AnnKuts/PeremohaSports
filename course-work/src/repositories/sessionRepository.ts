import prisma from "../lib/prisma";

export const SessionsRepository = {
  async findAll() {
    return prisma.class_session.findMany({
      take: 100,
      orderBy: { date: 'desc' },
      include: {
        trainer: { select: { first_name: true, last_name: true } },
        room_class_type: { include: { class_type: true, room: true } }
      }
    });
  },

  async findById(id: number) {
    return prisma.class_session.findUnique({
      where: { session_id: id },
      include: {
        trainer: { select: { first_name: true, last_name: true } },
        room_class_type: { include: { class_type: true, room: true } },
        attendance: true
      }
    });
  }
};