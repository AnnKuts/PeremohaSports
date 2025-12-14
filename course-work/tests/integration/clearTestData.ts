import prisma from "../../src/lib/prisma";

export async function clearTestData() {
  await prisma.attendance.deleteMany({});
  await prisma.class_session.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.room_class_type.deleteMany({});
  await prisma.trainer_placement.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.qualification.deleteMany({});
  await prisma.class_type.deleteMany({});
  await prisma.gym.deleteMany({});
}
