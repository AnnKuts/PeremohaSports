import prisma from "../lib/prisma";
import {
  CreatePaymentInput,
  UpdatePaymentInput,
  GetPaymentsQuery,
} from "../schemas/payments.schema";
import { emailService } from "./email.service";

export const paymentsService = {
  async getPayments(query?: GetPaymentsQuery) {
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

  async getPaymentById(id: number) {
    const payment = await prisma.payment.findUnique({
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

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  },

  async createPayment(data: CreatePaymentInput) {
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

  async updatePayment(id: number, data: UpdatePaymentInput) {
    const existingPayment = await prisma.payment.findUnique({
      where: { payment_id: id },
    });

    if (!existingPayment) {
      throw new Error("Payment not found");
    }

    const updatedPayment = await prisma.payment.update({
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

    if (data.status === "completed") {
      const completedCount = await prisma.payment.count({
        where: {
          client_id: updatedPayment.client_id,
          status: "completed",
        },
      });

      if (completedCount === 1) {
        const email = updatedPayment.client.contact_data.email;

        if (email) {
          const { code } = emailService.generateActivationCode(
            email,
            updatedPayment.client_id
          );

          await emailService.sendActivationEmail(email, code);
        }
      }
    }

    return updatedPayment;
  },
};
