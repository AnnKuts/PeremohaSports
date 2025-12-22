import prisma from '../lib/prisma';
import { CreateMembershipInput, UpdateMembershipInput } from '../schemas/memberships.schema';

export const membershipsRepository = {
  async expireOverdueMemberships() {
    return prisma.membership.updateMany({
      where: {
        status: 'active',
        end_date: {
          lt: new Date()
        }
      },
      data: {
        status: 'expired'
      }
    });
  },

  async findMany() {
    return prisma.membership.findMany({
      where: {
        status: {
          not: 'cancelled'
        }
      },
      include: {
        client: true,
        class_type: true
      },
      orderBy: { membership_id: 'desc' }
    });
  },

  async findById(id: number) {
    return prisma.membership.findUnique({
      where: { membership_id: id },
      include: {
        client: { include: { contact_data: true } },
        class_type: true
      }
    });
  },

  async findClientById(clientId: number) {
    return prisma.client.findUnique({ where: { client_id: clientId } });
  },

  async findClassTypeById(classTypeId: number) {
    return prisma.class_type.findUnique({ where: { class_type_id: classTypeId } });
  },

  async create(data: CreateMembershipInput) {
    return prisma.membership.create({
      data: {
        ...data,
        status: 'active'
      }
    });
  },

  async update(id: number, data: UpdateMembershipInput) {
    return prisma.membership.update({
      where: { membership_id: id },
      data
    });
  },

  async getPaymentsByMembershipId(id: number) {
    return prisma.payment.findMany({
      where: { membership_id: id },
      include: { client: true }
    });
  },

  async findMembershipsByClientId(clientId: number) {
    return prisma.membership.findMany({
      where: {
        client_id: clientId,
        status: {
          not: 'cancelled'
        }
      },
      include: {
        class_type: true
      }
    });
  },

  async softDelete(id: number) {
    return prisma.membership.update({
      where: { membership_id: id },
      data: { status: 'cancelled' }
    });
  }
};
