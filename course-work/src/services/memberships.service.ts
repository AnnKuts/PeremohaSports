import prisma from "../lib/prisma";

export const membershipsService = {
  async getMemberships() {
    return prisma.membership.findMany({
      include: {
        client: true,
        class_type: true,
      },
    });
  },

  async getMembershipById(id: number) {
    const membership = await prisma.membership.findUnique({
      where: { membership_id: id },
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
        class_type: true,
      },
    });

    if (!membership) {
      throw new Error("Membership not found");
    }

    return membership;
  },

  async getMembershipPayments(id: number) {
    const membership = await prisma.membership.findUnique({
      where: { membership_id: id },
    });

    if (!membership) {
      throw new Error("Membership not found");
    }

    return prisma.payment.findMany({
      where: { membership_id: id },
      include: {
        client: true,
      },
    });
  },

  async deleteMembership(id: number) {
    const membership = await prisma.membership.findUnique({
      where: { membership_id: id },
    });

    if (!membership) {
      throw new Error("Membership not found");
    }

    return prisma.membership.update({
      where: { membership_id: id },
      data: {
        status: "cancelled",
      },
    });
  },
};