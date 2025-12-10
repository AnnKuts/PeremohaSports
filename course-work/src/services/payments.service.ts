import prisma from "../lib/prisma";

export const paymentsService = {
  async getPayments() {
    return prisma.payment.findMany({
      include: {
        client: true,
        membership: {
          include: {
            class_type: true,
          },
        },
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
};