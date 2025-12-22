import { CreateMembershipInput, UpdateMembershipInput } from '../schemas/memberships.schema';
import { membershipsRepository } from '../repositories/memberships.repository';
import AppError from '../utils/AppError';

export const membershipsService = {
  async _expireOverdueMemberships() {
    await membershipsRepository.expireOverdueMemberships();
  },

  async getMemberships() {
    await this._expireOverdueMemberships();

    return membershipsRepository.findMany();
  },

  async getMembershipById(id: number) {
    await this._expireOverdueMemberships();

    const membership = await membershipsRepository.findById(id);

    if (!membership) throw new AppError('Membership not found', 404);
    return membership;
  },

  async createMembership(data: CreateMembershipInput) {
    const client = await membershipsRepository.findClientById(data.client_id);
    if (!client) throw new AppError('Client not found', 404);

    const classType = await membershipsRepository.findClassTypeById(data.class_type_id);
    if (!classType) throw new AppError('Class type not found', 404);

    return membershipsRepository.create(data);
  },

  async updateMembership(id: number, data: UpdateMembershipInput) {
    const membership = await membershipsRepository.findById(id);
    if (!membership) throw new AppError('Membership not found', 404);

    return membershipsRepository.update(id, data);
  },

  async getMembershipPayments(id: number) {
    const membership = await membershipsRepository.findById(id);
    if (!membership) throw new AppError('Membership not found', 404);

    return membershipsRepository.getPaymentsByMembershipId(id);
  },

  async getMembershipsByClient(clientId: number) {
    const client = await membershipsRepository.findClientById(clientId);
    if (!client) throw new AppError('Client not found', 404);

    return membershipsRepository.findMembershipsByClientId(clientId);
  },

  async deleteMembership(id: number) {
    const membership = await membershipsRepository.findById(id);
    if (!membership) throw new AppError('Membership not found', 404);

    return membershipsRepository.softDelete(id);
  }
};
