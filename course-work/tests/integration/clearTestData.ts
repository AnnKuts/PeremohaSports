import prisma from '../../src/lib/prisma';

export async function clearTestData() {
  await prisma.attendance.updateMany({ data: { is_deleted: true } });
  // await prisma.payment.updateMany({ data: { is_deleted: true } });
  // await prisma.class_session.updateMany({ data: { is_deleted: true } });
  // await prisma.room_class_type.updateMany({ data: { is_deleted: true } });
  // await prisma.trainer_placement.updateMany({ data: { is_deleted: true } });
  // await prisma.qualification.updateMany({ data: { is_deleted: true } });
  // await prisma.client.updateMany({ data: { is_deleted: true } });
  // await prisma.trainer.updateMany({ data: { is_deleted: true } });
  await prisma.room.updateMany({ data: { is_deleted: true } });
  await prisma.class_type.updateMany({ data: { is_deleted: true } });
  await prisma.gym.updateMany({ data: { is_deleted: true } });
  // await prisma.membership.deleteMany({});
  // await prisma.contact_data.deleteMany({});
}
