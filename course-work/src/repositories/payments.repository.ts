import prisma from "../lib/prisma";
import {
  CreatePaymentInput,
  UpdatePaymentInput,
  GetPaymentsQuery,
} from "../schemas/payments.schema";

export const paymentsRepository = {
  async findMany(query?: GetPaymentsQuery) {
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.method) {
      where.method = query.method;
    }

    if (query?.client_id) {
      where.client_id = Number(query.client_id);
    }

    return prisma.payment.findMany({
      where,
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
        membership: {
          include: {
            class_type: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },

  async findById(id: number) {
    return prisma.payment.findUnique({
      where: { payment_id: id },
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
        membership: {
          include: {
            class_type: true,
          },
        },
      },
    });
  },

  async create(data: CreatePaymentInput) {
    return prisma.payment.create({
      data,
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
        membership: {
          include: {
            class_type: true,
          },
        },
      },
    });
  },

  async update(id: number, data: UpdatePaymentInput) {
    return prisma.payment.update({
      where: { payment_id: id },
      data,
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
        membership: {
          include: {
            class_type: true,
          },
        },
      },
    });
  },

  async countCompletedByClientId(clientId: number) {
    return prisma.payment.count({
      where: {
        client_id: clientId,
        status: "completed",
      },
    });
  },
};

