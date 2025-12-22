import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerService } from '../../src/services/register.service';
import { registerRepository } from '../../src/repositories/register.repository';

vi.mock('../../src/repositories/register.repository', () => ({
  registerRepository: {
    findContactByEmailOrPhone: vi.fn(),
    findClassTypeById: vi.fn(),
    registerWithTransaction: vi.fn()
  }
}));

describe('RegisterService (unit)', () => {
  const validData: any = {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    email: 'john@example.com',
    phone: '+380501234567',
    membershipType: 1,
    startDate: '2023-01-01',
    endDate: '2023-02-01',
    price: 100,
    paymentMethod: 'card'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register: throws if required fields missing', async () => {
    await expect(registerService.register({ ...validData, firstName: '' })).rejects.toThrow(
      'First name and last name are required'
    );
  });

  it('register: throws if email invalid', async () => {
    await expect(registerService.register({ ...validData, email: 'invalid' })).rejects.toThrow(
      'Invalid email format'
    );
  });

  it('register: throws if user already exists', async () => {
    // Mock findContactByEmailOrPhone to return something
    (registerRepository.findContactByEmailOrPhone as any).mockResolvedValue({ id: 1 });
    await expect(registerService.register(validData)).rejects.toThrow(
      'Email or phone already exists'
    );
  });

  it('register: throws if class type invalid', async () => {
    (registerRepository.findContactByEmailOrPhone as any).mockResolvedValue(null);
    (registerRepository.findClassTypeById as any).mockResolvedValue(null);
    await expect(registerService.register(validData)).rejects.toThrow('Invalid membership type');
  });

  it('register: success', async () => {
    (registerRepository.findContactByEmailOrPhone as any).mockResolvedValue(null);
    (registerRepository.findClassTypeById as any).mockResolvedValue({ id: 1 });
    (registerRepository.registerWithTransaction as any).mockResolvedValue({
      clientId: 1,
      paymentId: 1
    });

    const result = await registerService.register(validData);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ clientId: 1, paymentId: 1 });
    expect(registerRepository.registerWithTransaction).toHaveBeenCalledWith(validData);
  });
});
