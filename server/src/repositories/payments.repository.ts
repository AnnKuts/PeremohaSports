import prisma from '../lib/prisma';
import {
  CreatePaymentInput,
  UpdatePaymentInput,
  GetPaymentsQuery
} from '../schemas/payments.schema';

export const paymentsRepository = {
  async findMany(query?: GetPaymentsQuery) {
    const where: any = {
      is_deleted: false
    };

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
            contact_data: true
          }
        },
        membership: {
          include: {
            class_type: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  },

  async findById(id: number) {
    return prisma.payment.findUnique({
      where: { payment_id: id, is_deleted: false },
      include: {
        client: {
          include: {
            contact_data: true
          }
        },
        membership: {
          include: {
            class_type: true
          }
        }
      }
    });
  },

  async create(data: CreatePaymentInput) {
    return prisma.payment.create({
      data,
      include: {
        client: {
          include: {
            contact_data: true
          }
        },
        membership: {
          include: {
            class_type: true
          }
        }
      }
    });
  },

  async update(id: number, data: UpdatePaymentInput) {
    return prisma.payment.update({
      where: { payment_id: id },
      data,
      include: {
        client: {
          include: {
            contact_data: true
          }
        },
        membership: {
          include: {
            class_type: true
          }
        }
      }
    });
  },

  async countCompletedByClientId(clientId: number) {
    return prisma.payment.count({
      where: {
        client_id: clientId,
        status: 'completed'
      }
    });
  },

  async getRevenueByClassType(year?: number, month?: number) {
    const whereConditions: any = {
      status: 'completed',
      is_deleted: false
    };

    if (year || month) {
      whereConditions.created_at = {};

      if (year && month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        whereConditions.created_at.gte = startDate;
        whereConditions.created_at.lte = endDate;
      } else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        whereConditions.created_at.gte = startDate;
        whereConditions.created_at.lte = endDate;
      }
    }

    return prisma.payment.findMany({
      where: whereConditions,
      include: {
        membership: {
          include: {
            class_type: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });
  },

  async softDelete(id: number) {
    return prisma.payment.update({
      where: { payment_id: id },
      data: { is_deleted: true }
    });
  }
};
