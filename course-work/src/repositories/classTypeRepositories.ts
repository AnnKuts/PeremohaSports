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
        where: { is_deleted: false },
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
      this.prisma.class_type.count({ where: { is_deleted: false } }),
    ]);

    return { classTypes, total };
  }

  async findById(classTypeId: number) {
    return await this.prisma.class_type.findFirst({
      where: { class_type_id: classTypeId, is_deleted: false },
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

  async findTrainersByClassTypeId(
    classTypeId: number,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit, offset } = options;
    const qualifications = await this.prisma.qualification.findMany({
      where: { class_type_id: classTypeId },
      include: {
        trainer: {
          include: {
            contact_data: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });
    return qualifications.map((q: any) => q.trainer);
  }

  async getTrainers(
    classTypeId: number,
    options: { limit?: number; offset?: number } = {}
  ) {
    return await this.findTrainersByClassTypeId(classTypeId, options);
  }
  
  async update(classTypeId: number, updateData: Partial<{ name: string; description?: string; level?: string }>) {
    const data: any = { ...updateData };
    if (data.name === "swimming pool") data.name = "swimming_pool";
    if (data.name && !["workout", "yoga", "swimming_pool"].includes(data.name)) delete data.name;
    if (data.level && !["beginner", "intermediate", "advanced"].includes(data.level)) delete data.level;
    const updated = await this.prisma.class_type.updateMany({
      where: { class_type_id: classTypeId, is_deleted: false },
      data,
    });
    if (updated.count === 0) return null;
    return await this.prisma.class_type.findFirst({
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
}