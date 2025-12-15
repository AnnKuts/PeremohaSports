import type { PrismaClient } from "@prisma/client";
import type { IClassTypeRepository } from "../interfaces/entitiesInterfaces";

export class ClassTypeRepository implements IClassTypeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any) {
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

  async findAll(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
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

  async findById(classTypeId: number) {
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

  async findTrainersByClassTypeId(classTypeId: number) {
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
    return qualifications.map((q: any) => q.trainer);
  }

  async getTrainers(classTypeId: number) {
    return await this.findTrainersByClassTypeId(classTypeId);
  }
}