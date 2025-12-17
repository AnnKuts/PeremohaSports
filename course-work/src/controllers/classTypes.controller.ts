import type { Response } from "express";

import type { ClassTypeService } from "../services/classTypes.service";
import type { ValidatedRequest } from "../types/requests.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";
import AppError from "../utils/AppError.js";

export class ClassTypeController {
  constructor(private classTypeService: ClassTypeService) {}

  createClassType = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { name, description, level } = req.validated?.body || {};
  const classType = await this.classTypeService.createClassType({ name, description, level });
    res.status(201).json(successResponse(classType, { message: "Class type created successfully" }));
  });

  getAllClassTypes = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { includeStats, limit, offset } = req.validated?.query || {};
    const result = await this.classTypeService.getAllClassTypes({ includeStats, limit, offset });
    res.json(successResponse(result.classTypes, { total: result.total }));
  });

  getClassTypeById = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const classType = await this.classTypeService.getClassTypeById(id);
    if (!classType) {
      throw new AppError("Class type not found", 404);
    }
    res.json(successResponse(classType));
  });

  getClassTypeTrainers = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const trainers = await this.classTypeService.getClassTypeTrainers(id);
    res.json({ ...successResponse(trainers), class_type_id: id });
  });

  updateClassType = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const updateData = req.validated?.body || {};
    const updated = await this.classTypeService.updateClassType(Number(id), updateData);
    if (!updated) {
      throw new AppError("Class type not found", 404);
    }
    res.json(successResponse(updated, { message: "Class type updated successfully" }));
  });

  delete = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const deleted = await this.classTypeService.DeleteClassType(Number(id));
    if (!deleted) {
      throw new AppError("Class type not found", 404);
    }
    res.json(successResponse(deleted, { message: "Class type soft-deleted successfully" }));
  });

  getMonthlyRevenueByClassType = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { minRevenue, minAttendance, months } = req.validated?.query || {};
    const result = await this.classTypeService.getMonthlyRevenueByClassType({ minRevenue, minAttendance, months });
    res.json(convertBigInt(result));
  });
}

function convertBigInt(obj: any): any {
  if (Array.isArray(obj)) return obj.map(convertBigInt);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, typeof v === "bigint" ? Number(v) : convertBigInt(v)])
    );
  }
  return obj;
}