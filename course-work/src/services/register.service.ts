import prisma from "../lib/prisma";

interface RegisterData {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  email: string;
  phone: string;
  membershipType: number;
  startDate: string;
  endDate: string;
  price: number;
  paymentMethod: "cash" | "card" | "online";
  isDisposable?: boolean;
}

export const registerService = {
  async register(data: RegisterData) {
    if (!data.firstName || !data.lastName) {
      throw new Error("First name and last name are required");
    }
    if (!data.email || !data.phone) {
      throw new Error("Email and phone are required");
    }
    if (!data.membershipType) {
      throw new Error("Membership type is required");
    }
    if (!data.paymentMethod) {
      throw new Error("Payment method is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(data.phone)) {
      throw new Error("Invalid phone format");
    }

    return prisma.$transaction(async (tx) => {
      const existing = await tx.contact_data.findFirst({
        where: {
          OR: [
            {email: data.email},
            {phone: data.phone}
          ]
        }
      });

      if (existing) {
        throw new Error("Email or phone already exists");
      }

      const classType = await tx.class_type.findUnique({
        where: {class_type_id: data.membershipType}
      });

      if (!classType) {
        throw new Error("Invalid membership type");
      }

      const contact = await tx.contact_data.create({
        data: {
          email: data.email,
          phone: data.phone
        },
      });

      const client = await tx.client.create({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          gender: data.gender,
          contact_data_id: contact.contact_data_id,
        },
      });

      const membership = await tx.membership.create({
        data: {
          client_id: client.client_id,
          class_type_id: data.membershipType,
          start_date: new Date(data.startDate),
          end_date: new Date(data.endDate),
          price: data.price,
          status: "active",
          is_disposable: data.isDisposable || false,
        },
      });

      const payment = await tx.payment.create({
        data: {
          client_id: client.client_id,
          membership_id: membership.membership_id,
          amount: data.price,
          method: data.paymentMethod,
          status: "pending",
        },
      });

      return {
        success: true,
        data: {
          contact,
          client,
          membership,
          payment
        }
      };
    });
  },
};