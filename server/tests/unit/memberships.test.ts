import { describe, it, expect, vi, beforeEach } from 'vitest';
import { membershipsService } from '../../src/services/memberships.service';
import { membershipsRepository } from '../../src/repositories/memberships.repository';
import AppError from '../../src/utils/AppError';

vi.mock('../../src/repositories/memberships.repository', () => ({
  membershipsRepository: {
    expireOverdueMemberships: vi.fn(),
    findMany: vi.fn(),
    findById: vi.fn(),
    findClientById: vi.fn(),
    findClassTypeById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getPaymentsByMembershipId: vi.fn(),
    softDelete: vi.fn()
  }
}));

describe('MembershipsService (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMembershipById', () => {
    it('returns membership if found', async () => {
      const mockMembership = { membership_id: 1 };
      (membershipsRepository.findById as any).mockResolvedValue(mockMembership);

      const result = await membershipsService.getMembershipById(1);
      expect(result).toBe(mockMembership);
      expect(membershipsRepository.expireOverdueMemberships).toHaveBeenCalled();
    });

    it('throws AppError if not found', async () => {
      (membershipsRepository.findById as any).mockResolvedValue(null);

      await expect(membershipsService.getMembershipById(1)).rejects.toThrow(AppError);
      // Optional: check statusCode if you want to be specific, or message
      await expect(membershipsService.getMembershipById(1)).rejects.toThrow('Membership not found');
    });
  });

  describe('createMembership', () => {
    const validData: any = { client_id: 1, class_type_id: 1 };

    it('creates membership if client and class type exist', async () => {
      (membershipsRepository.findClientById as any).mockResolvedValue({ client_id: 1 });
      (membershipsRepository.findClassTypeById as any).mockResolvedValue({ class_type_id: 1 });
      (membershipsRepository.create as any).mockResolvedValue({ membership_id: 1 });

      const result = await membershipsService.createMembership(validData);
      expect(result).toEqual({ membership_id: 1 });
    });

    it('throws AppError if client not found', async () => {
      (membershipsRepository.findClientById as any).mockResolvedValue(null);
      await expect(membershipsService.createMembership(validData)).rejects.toThrow(
        'Client not found'
      );
    });

    it('throws AppError if class type not found', async () => {
      (membershipsRepository.findClientById as any).mockResolvedValue({ client_id: 1 });
      (membershipsRepository.findClassTypeById as any).mockResolvedValue(null);
      await expect(membershipsService.createMembership(validData)).rejects.toThrow(
        'Class type not found'
      );
    });
  });

  describe('deleteMembership', () => {
    it('soft deletes if found', async () => {
      (membershipsRepository.findById as any).mockResolvedValue({ membership_id: 1 });
      (membershipsRepository.softDelete as any).mockResolvedValue({
        membership_id: 1,
        status: 'cancelled'
      });

      const result = await membershipsService.deleteMembership(1);
      expect(result.status).toBe('cancelled');
    });

    it('throws AppError if not found', async () => {
      (membershipsRepository.findById as any).mockResolvedValue(null);
      await expect(membershipsService.deleteMembership(1)).rejects.toThrow('Membership not found');
    });
  });
});
