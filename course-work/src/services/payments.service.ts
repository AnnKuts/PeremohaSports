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
      const completedCount = await paymentsRepository.countCompletedByClientId(updatedPayment.client_id);
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
