import type { Prisma, PrismaClient } from '@prisma/client';

export async function softDeleteRoom(tx: Prisma.TransactionClient | PrismaClient, roomId: number) {
  await tx.room.update({
    where: { room_id: roomId },
    data: { is_deleted: true }
  });
  await tx.room_class_type.updateMany({
    where: { room_id: roomId },
    data: { is_deleted: true }
  });
  await tx.class_session.updateMany({
    where: { room_id: roomId },
    data: { is_deleted: true }
  });
  const sessions = await tx.class_session.findMany({
    where: { room_id: roomId },
    select: { session_id: true }
  });
  const sessionIds = sessions.map((s: { session_id: number }) => s.session_id);
  if (sessionIds.length > 0) {
    await tx.attendance.updateMany({
      where: { session_id: { in: sessionIds } },
      data: { status: 'cancelled', is_deleted: true }
    });
  }
}
