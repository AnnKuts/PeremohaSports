import prisma from "../lib/prisma";
import { UpdateClientInput } from "../schemas/clients.schema.js";

export const clientsRepository = {
  async findMany(active?: boolean) {
    const where: any = active
      ? {
        membership: {
          some: { status: "active" as const },
        },
      }
      : {};

    where.is_deleted = false;

    return prisma.client.findMany({
      where,
      select: {
        client_id: true,
        first_name: true,
        last_name: true,
        gender: true,
        membership: {
          where: active ? { status: "active" as const } : undefined,
          select: {
            status: true,
            end_date: true,
          },
          orderBy: { end_date: "desc" as const },
          take: 1,
        },
      },
    });
  },

  async findById(id: number) {
    return prisma.client.findUnique({
      where: { client_id: id, is_deleted: false },
      include: {
        contact_data: true,
        membership: { include: { class_type: true } },
        payment: { include: { membership: true } },
        attendance: {
          include: {
            class_session: { include: { trainer: true } },
          },
        },
      },
    });
  },

  async findByIdWithContactData(id: number) {
    return prisma.client.findUnique({
      where: { client_id: id, is_deleted: false },
      include: { contact_data: true },
    });
  },

  async getMembershipsByClientId(id: number) {
    return prisma.membership.findMany({
      where: { client_id: id },
      include: { class_type: true },
    });
  },

  async getPaymentsByClientId(id: number) {
    return prisma.payment.findMany({
      where: { client_id: id },
      include: {
        membership: { include: { class_type: true } },
      },
    });
  },

  async getAttendanceByClientId(id: number) {
    return prisma.attendance.findMany({
      where: { client_id: id },
      include: {
        class_session: { include: { trainer: true } },
      },
    });
  },

  async updateWithTransaction(id: number, data: UpdateClientInput, contactDataId: number) {
    return prisma.$transaction(async (tx) => {
      if (data.contact_data?.email || data.contact_data?.phone) {
        const whereConditions = [];

        if (data.contact_data.email) whereConditions.push({ email: data.contact_data.email });
        if (data.contact_data.phone) whereConditions.push({ phone: data.contact_data.phone });

        const existing = await tx.contact_data.findFirst({
          where: {
            OR: whereConditions,
            NOT: { contact_data_id: contactDataId },
          },
        });

        if (existing) throw new Error("Email or phone already exists");

        await tx.contact_data.update({
          where: { contact_data_id: contactDataId },
          data: {
            ...(data.contact_data.email && { email: data.contact_data.email }),
            ...(data.contact_data.phone && { phone: data.contact_data.phone }),
          },
        });
      }

      return tx.client.update({
        where: { client_id: id },
        data: {
          ...(data.first_name && { first_name: data.first_name }),
          ...(data.last_name && { last_name: data.last_name }),
          ...(data.gender && { gender: data.gender }),
        },
        include: { contact_data: true },
      });
    });
  },
  async softDelete(id: number) {
    return prisma.client.update({
      where: { client_id: id },
      data: { is_deleted: true },
    });
  },
};

