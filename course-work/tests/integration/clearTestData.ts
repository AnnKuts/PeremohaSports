import prisma from "../../src/lib/prisma";

export async function clearTestData() {
  await prisma.$transaction([
    prisma.attendance.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.class_session.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.room_class_type.deleteMany(),
    prisma.qualification.deleteMany(),
    prisma.trainer_placement.deleteMany(),
    prisma.room.deleteMany(),
    prisma.trainer.deleteMany(),
    prisma.client.deleteMany(),
    prisma.class_type.deleteMany(),
    prisma.gym.deleteMany(),
    prisma.contact_data.deleteMany(),
  ]);
}