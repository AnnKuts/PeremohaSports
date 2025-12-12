import prisma from "../lib/prisma";
import { UpdateClientInput } from "../schemas/clients.schema.js";

export const clientsService = {
  async getClients(active?: boolean) {
    const where = active
      ? {
        membership: {
          some: { status: "active" as const },
        },
      }
      : {};

    const clients = await prisma.client.findMany({
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

    return clients.map((client) => ({
      client_id: client.client_id,
      first_name: client.first_name,
      last_name: client.last_name,
      gender: client.gender,
      membership: client.membership?.[0] ?? null,
    }));
  },

  async getClientById(id: number) {
    const client = await prisma.client.findUnique({
      where: { client_id: id },
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

    if (!client) throw new Error("Client not found");
    return client;
  },

  async getClientMemberships(id: number) {
    const exists = await prisma.client.findUnique({ where: { client_id: id } });
    if (!exists) throw new Error("Client not found");

    return prisma.membership.findMany({
      where: { client_id: id },
      include: { class_type: true },
    });
  },

  async getClientPayments(id: number) {
    const exists = await prisma.client.findUnique({ where: { client_id: id } });
    if (!exists) throw new Error("Client not found");

    return prisma.payment.findMany({
      where: { client_id: id },
      include: {
        membership: { include: { class_type: true } },
      },
    });
  },

  async getClientAttendance(id: number) {
    const exists = await prisma.client.findUnique({ where: { client_id: id } });
    if (!exists) throw new Error("Client not found");

    return prisma.attendance.findMany({
      where: { client_id: id },
      include: {
        class_session: { include: { trainer: true } },
      },
    });
  },

  async updateClient(id: number, data: UpdateClientInput) {
    const client = await prisma.client.findUnique({
      where: { client_id: id },
      include: { contact_data: true },
    });

    if (!client) throw new Error("Client not found");

    return prisma.$transaction(async (tx) => {
      if (data.contact_data?.email || data.contact_data?.phone) {
        const whereConditions = [];

        if (data.contact_data.email) whereConditions.push({ email: data.contact_data.email });
        if (data.contact_data.phone) whereConditions.push({ phone: data.contact_data.phone });

        const existing = await tx.contact_data.findFirst({
          where: {
            OR: whereConditions,
            NOT: { contact_data_id: client.contact_data_id },
          },
        });

        if (existing) throw new Error("Email or phone already exists");

        await tx.contact_data.update({
          where: { contact_data_id: client.contact_data_id },
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
};