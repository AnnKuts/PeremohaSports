import type { CreateClassTypeData } from "../types/entities.js";
import type { IClassTypeRepository } from "../interfaces/entitiesInterfaces.js";

export class ClassTypeService {
  constructor(private classTypeRepository: IClassTypeRepository) {}

  async createClassType(data: CreateClassTypeData) {
    return await this.classTypeRepository.create(data);
  }

  async getAllClassTypes(options: { includeStats?: boolean; limit?: number; offset?: number } = {}) {
    return await this.classTypeRepository.findAll(options);
  }

  async getClassTypeById(classTypeId: number) {
    return await this.classTypeRepository.findById(classTypeId);
  }

  async getClassTypeTrainers(classTypeId: number) {
    return await this.classTypeRepository.getTrainers(classTypeId);
  }
}
