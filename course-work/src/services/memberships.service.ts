import { CreateMembershipInput, UpdateMembershipInput } from "../schemas/memberships.schema";
import { membershipsRepository } from "../repositories/memberships.repository";

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

    if (!membership) throw new Error("Membership not found");
    return membership;
  },

  async createMembership(data: CreateMembershipInput) {
    const client = await membershipsRepository.findClientById(data.client_id);
    if (!client) throw new Error("Client not found");

    const classType = await membershipsRepository.findClassTypeById(data.class_type_id);
    if (!classType) throw new Error("Class type not found");

    return membershipsRepository.create(data);
  },

  async updateMembership(id: number, data: UpdateMembershipInput) {
    const membership = await membershipsRepository.findById(id);
    if (!membership) throw new Error("Membership not found");

    return membershipsRepository.update(id, data);
  },

  async getMembershipPayments(id: number) {
    const membership = await membershipsRepository.findById(id);
    if (!membership) throw new Error("Membership not found");

    return membershipsRepository.getPaymentsByMembershipId(id);
  },

  async deleteMembership(id: number) {
    const membership = await membershipsRepository.findById(id);
    if (!membership) throw new Error("Membership not found");

    return membershipsRepository.softDelete(id);
  },
};