import prisma from "../lib/prisma";
import { CreateMembershipInput, UpdateMembershipInput } from "../schemas/memberships.schema";

export const membershipsService = {
  async _expireOverdueMemberships() {
    await prisma.membership.updateMany({
      where: {
        status: "active",
        end_date: {
          lt: new Date(),
        },
      },
      data: {
        status: "expired",
      },
    });
  },

  async getMemberships() {
    await this._expireOverdueMemberships();

    return prisma.membership.findMany({
      include: {
        client: true,
        class_type: true,
      },
      orderBy: { membership_id: 'desc' }
    });
  },

  async getMembershipById(id: number) {
    await this._expireOverdueMemberships();

    const membership = await prisma.membership.findUnique({
      where: { membership_id: id },
      include: {
        client: { include: { contact_data: true } },
        class_type: true,
      },
    });

    if (!membership) throw new Error("Membership not found");
    return membership;
  },

  async createMembership(data: CreateMembershipInput) {
    const client = await prisma.client.findUnique({ where: { client_id: data.client_id } });
    if (!client) throw new Error("Client not found");

    const classType = await prisma.class_type.findUnique({ where: { class_type_id: data.class_type_id } });
    if (!classType) throw new Error("Class type not found");

    return prisma.membership.create({
      data: {
        ...data,
        status: "active",
      },
    });
  },

  async updateMembership(id: number, data: UpdateMembershipInput) {
    const membership = await prisma.membership.findUnique({ where: { membership_id: id } });
    if (!membership) throw new Error("Membership not found");

    return prisma.membership.update({
      where: { membership_id: id },
      data,
    });
  },

  async getMembershipPayments(id: number) {
    const membership = await prisma.membership.findUnique({ where: { membership_id: id } });
    if (!membership) throw new Error("Membership not found");

    return prisma.payment.findMany({
      where: { membership_id: id },
      include: { client: true },
    });
  },

  async deleteMembership(id: number) {
    const membership = await prisma.membership.findUnique({ where: { membership_id: id } });
    if (!membership) throw new Error("Membership not found");

    return prisma.membership.update({
      where: { membership_id: id },
      data: { status: "cancelled" },
    });
  },
};