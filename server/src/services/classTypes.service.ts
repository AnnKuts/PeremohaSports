import type { IClassTypeRepository } from '../interfaces/entitiesInterfaces.js';

export class ClassTypeService {
  constructor(private classTypeRepository: IClassTypeRepository) {}

  async createClassType(data: { name: string; description?: string; level: string }) {
    return await this.classTypeRepository.create(data);
  }

  async getAllClassTypes(
    options: { includeStats?: boolean; limit?: number; offset?: number } = {}
  ) {
    return await this.classTypeRepository.findAll(options);
  }

  async getClassTypeById(classTypeId: number) {
    return await this.classTypeRepository.findById(classTypeId);
  }

  async getClassTypeTrainers(classTypeId: number) {
    return await this.classTypeRepository.getTrainers(classTypeId);
  }

  async updateClassType(
    classTypeId: number,
    updateData: Partial<{ name: string; description?: string; level?: string }>
  ) {
    return await this.classTypeRepository.update(classTypeId, updateData);
  }

  async DeleteClassType(classTypeId: number) {
    return await this.classTypeRepository.delete(classTypeId);
  }

  async getMonthlyRevenueByClassType(
    options: { minRevenue?: number; minAttendance?: number; months?: number } = {}
  ) {
    return await this.classTypeRepository.getMonthlyRevenueByClassType(options);
  }
}
