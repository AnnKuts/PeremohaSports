import prisma from "../lib/prisma";

      interface UpdateClientData {
        firstName?: string;
        lastName?: string;
        gender?: "male" | "female";
        email?: string;
        phone?: string;
      }

      export const clientsService = {
        async getClients(active?: boolean) {
          const where = active
            ? {
              membership: {
                some: {
                  status: "active" as const,
                },
              },
            }
            : {};

          const clients = await prisma.client.findMany({
            where,
            select: {
              client_id: true,
              first_name: true,
              last_name: true,
              gender: true,
              membership: {
                where: active ? { status: "active" } : undefined,
                select: {
                  status: true,
                  end_date: true,
                },
                orderBy: {
                  end_date: "desc",
                },
                take: 1,
              },
            },
          });

          return clients.map((client) => ({
            client_id: client.client_id,
            first_name: client.first_name,
            last_name: client.last_name,
            gender: client.gender,
            membership: client.membership[0] || null,
          }));
        },

        async getClientById(id: number) {
          const client = await prisma.client.findUnique({
            where: { client_id: id },
            include: {
              contact_data: true,
              membership: {
                include: {
                  class_type: true,
                },
              },
              payment: {
                include: {
                  membership: true,
                },
              },
              attendance: {
                include: {
                  class_session: {
                    include: {
                      trainer: true,
                    },
                  },
                },
              },
            },
          });

          if (!client) {
            throw new Error("Client not found");
          }

          return client;
        },

        async getClientMemberships(id: number) {
          const client = await prisma.client.findUnique({
            where: { client_id: id },
          });

          if (!client) {
            throw new Error("Client not found");
          }

          return prisma.membership.findMany({
            where: { client_id: id },
            include: {
              class_type: true,
            },
          });
        },

        async getClientPayments(id: number) {
          const client = await prisma.client.findUnique({
            where: { client_id: id },
          });

          if (!client) {
            throw new Error("Client not found");
          }

          return prisma.payment.findMany({
            where: { client_id: id },
            include: {
              membership: {
                include: {
                  class_type: true,
                },
              },
            },
          });
        },

        async getClientAttendance(id: number) {
          const client = await prisma.client.findUnique({
            where: { client_id: id },
          });

          if (!client) {
            throw new Error("Client not found");
          }

          return prisma.attendance.findMany({
            where: { client_id: id },
            include: {
              class_session: {
                include: {
                  trainer: true,
                },
              },
            },
          });
        },

        async updateClient(id: number, data: UpdateClientData) {
          const client = await prisma.client.findUnique({
            where: { client_id: id },
            include: { contact_data: true },
          });

          if (!client) {
            throw new Error("Client not found");
          }

          return prisma.$transaction(async (tx) => {
            if (data.email || data.phone) {
              const existing = await tx.contact_data.findFirst({
                where: {
                  OR: [
                    data.email ? { email: data.email } : undefined,
                    data.phone ? { phone: data.phone } : undefined,
                  ].filter(Boolean) as Array<{ email: string } | { phone: string }>,
                  NOT: {
                    contact_data_id: client.contact_data_id,
                  },
                },
              });

              if (existing) {
                throw new Error("Email or phone already exists");
              }

              await tx.contact_data.update({
                where: { contact_data_id: client.contact_data_id },
                data: {
                  email: data.email,
                  phone: data.phone,
                },
              });
            }

            const updatedClient = await tx.client.update({
              where: { client_id: id },
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
                gender: data.gender,
              },
              include: {
                contact_data: true,
              },
            });

            return updatedClient;
          });
        },
      };