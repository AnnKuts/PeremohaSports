import type { PrismaClient } from "@prisma/client";

import type { CreateClassTypeData } from "../types/index.js";

export class ClassTypeService {
  constructor(private prisma: PrismaClient) {}

  async createClassType(data: CreateClassTypeData) {
    return await this.prisma.class_type.create({
      data: {
        name: data.name as any,
        description: data.description,
        level: data.level as any,
      },
      include: {
        _count: {
          select: {
            membership: true,
            qualification: true,
            room_class_type: true,
          },
        },
      },
    });
  }

  async getAllClassTypes(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    const { includeStats = true, limit, offset } = options;

    const [classTypes, total] = await Promise.all([
      this.prisma.class_type.findMany({
        include: includeStats
          ? {
              _count: {
                select: {
                  membership: true,
                  qualification: true,
                  room_class_type: true,
                },
              },
            }
          : undefined,
        orderBy: { class_type_id: "asc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.class_type.count(),
    ]);

    return { classTypes, total };
  }

  async getClassTypeById(classTypeId: number) {
    return await this.prisma.class_type.findUnique({
      where: { class_type_id: classTypeId },
      include: {
        _count: {
          select: {
            membership: true,
            qualification: true,
            room_class_type: true,
          },
        },
      },
    });
  }

  async getClassTypeTrainers(classTypeId: number) {
    const qualifications = await this.prisma.qualification.findMany({
      where: { class_type_id: classTypeId },
      include: {
        trainer: {
          include: {
            contact_data: true,
          },
        },
      },
    });
    return qualifications.map(q => q.trainer);
  }
}
