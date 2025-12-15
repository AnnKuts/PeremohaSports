import {
  CreatePaymentInput,
  UpdatePaymentInput,
  GetPaymentsQuery,
} from "../schemas/payments.schema";
import { emailService } from "./email.service";
import { paymentsRepository } from "../repositories/payments.repository";

export const paymentsService = {
  async getPayments(query?: GetPaymentsQuery) {
    return paymentsRepository.findMany(query);
  },

  async getPaymentById(id: number) {
    const payment = await paymentsRepository.findById(id);

    if (!payment) {
      throw new Error("Payment not found");
    }
    return payment;
  },

  async createPayment(data: CreatePaymentInput) {
    return paymentsRepository.create(data);
  },

  async updatePayment(id: number, data: UpdatePaymentInput) {
    const existingPayment = await paymentsRepository.findById(id);

    if (!existingPayment) {
      throw new Error("Payment not found");
    }

    const updatedPayment = await paymentsRepository.update(id, data);

    if (data.status === "completed") {
      const completedCount =
        await paymentsRepository.countCompletedByClientId(
          updatedPayment.client_id,
        );

      if (completedCount === 1) {
        const email = updatedPayment.client.contact_data.email;

        if (email) {
          const { code } = emailService.generateActivationCode({
            email,
            actor: "client",
            actorId: updatedPayment.client_id,
          });

          await emailService.sendActivationEmail(email, code);
        }
      }
    }

    return updatedPayment;
  },

  async getRevenueByClassType(year?: number, month?: number) {
    const payments = await paymentsRepository.getRevenueByClassType(year, month);

    const revenueMap = new Map<string, Map<string, { revenue: number; count: number; classTypeId: number }>>();

    for (const payment of payments) {
      const paymentDate = new Date(payment.created_at);
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
      const classTypeName = payment.membership?.class_type?.name || 'Unknown';
      const classTypeId = payment.membership?.class_type?.class_type_id || 0;

      if (!revenueMap.has(monthKey)) {
        revenueMap.set(monthKey, new Map());
      }

      const monthData = revenueMap.get(monthKey)!;

      if (!monthData.has(classTypeName)) {
        monthData.set(classTypeName, { revenue: 0, count: 0, classTypeId });
      }

      const classTypeData = monthData.get(classTypeName)!;
      classTypeData.revenue += Number(payment.amount);
      classTypeData.count += 1;
    }

    const result = Array.from(revenueMap.entries()).map(([month, classTypes]) => ({
      month,
      classTypes: Array.from(classTypes.entries()).map(([name, data]) => ({
        classTypeId: data.classTypeId,
        classTypeName: name,
        totalRevenue: data.revenue,
        paymentsCount: data.count,
      })),
      totalMonthRevenue: Array.from(classTypes.values()).reduce((sum, data) => sum + data.revenue, 0),
    }));

    return result;
  },
};
