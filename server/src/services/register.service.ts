import { registerRepository } from '../repositories/register.repository';
import AppError from '../utils/AppError';

interface RegisterData {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  email: string;
  phone: string;
  membershipType: number;
  startDate: string;
  endDate: string;
  price: number;
  paymentMethod: 'cash' | 'card' | 'online';
  isDisposable?: boolean;
}

export const registerService = {
  async register(data: RegisterData) {
    if (!data.firstName || !data.lastName) {
      throw new AppError('First name and last name are required', 400);
    }
    if (!data.email || !data.phone) {
      throw new AppError('Email and phone are required', 400);
    }
    if (!data.membershipType) {
      throw new AppError('Membership type is required', 400);
    }
    if (!data.paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError('Invalid email format', 400);
    }

    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(data.phone)) {
      throw new AppError('Invalid phone format', 400);
    }

    const existingContact = await registerRepository.findContactByEmailOrPhone(
      data.email,
      data.phone
    );

    if (existingContact) {
      throw new AppError('Email or phone already exists', 409);
    }

    const classType = await registerRepository.findClassTypeById(data.membershipType);

    if (!classType) {
      throw new AppError('Invalid membership type', 400);
    }

    const result = await registerRepository.registerWithTransaction(data);

    return {
      success: true,
      data: result
    };
  }
};
