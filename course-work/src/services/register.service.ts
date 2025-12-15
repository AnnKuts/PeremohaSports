import { registerRepository } from "../repositories/register.repository";

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

    const existing = await registerRepository.findContactByEmailOrPhone(data.email, data.phone);

    if (existing) {
      throw new Error("Email or phone already exists");
    }

    const classType = await registerRepository.findClassTypeById(data.membershipType);

    if (!classType) {
      throw new Error("Invalid membership type");
    }

    const result = await registerRepository.registerWithTransaction(data);

    return {
      success: true,
      data: result
    };
  },
};