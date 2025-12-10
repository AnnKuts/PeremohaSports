import type { PrismaClient } from "@prisma/client";

export class AttendanceService {
  constructor(private prisma: PrismaClient) {}

  async getAllAttendances(options: { limit?: number; offset?: number } = {}) {
    const { limit, offset } = options;

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        include: {
          client: {
            include: {
              contact_data: true,
            },
          },
          class_session: {
            include: {
              room_class_type: {
                include: {
                  class_type: true,
                  room: {
                    include: {
                      gym: true,
                    },
                  },
                },
              },
              trainer: {
                include: {
                  contact_data: true,
                },
              },
            },
          },
        },
        orderBy: [
          { session_id: "desc" },
          { client_id: "asc" },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.attendance.count(),
    ]);

    return { attendances, total };
  }

  async getAttendanceById(sessionId: number, clientId: number) {
    return await this.prisma.attendance.findUnique({
      where: {
        session_id_client_id: {
          session_id: sessionId,
          client_id: clientId,
        },
      },
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
        class_session: {
          include: {
            room_class_type: {
              include: {
                class_type: true,
                room: {
                  include: {
                    gym: true,
                  },
                },
              },
            },
            trainer: {
              include: {
                contact_data: true,
              },
            },
          },
        },
      },
    });
  }

  async getAttendancesBySessionId(sessionId: number) {
    return await this.prisma.attendance.findMany({
      where: { session_id: sessionId },
      include: {
        client: {
          include: {
            contact_data: true,
          },
        },
      },
      orderBy: {
        client_id: "asc",
      },
    });
  }
}
