import type { Request, Response } from "express";

import type { ClassTypeService } from "../services/classTypesServices.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";
import { parseId, parsePaginationParams } from "../utils/validation.js";

export class ClassTypeController {
  constructor(private classTypeService: ClassTypeService) {}

  createClassType = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, level } = req.body;

    if (!name?.trim() || !level?.trim()) {
      return res.status(400).json({ error: "Name and level are required" });
    }

    const classType = await this.classTypeService.createClassType({
      name: name.trim(),
      description: description?.trim(),
      level: level.trim(),
    });
    res.status(201).json(successResponse(classType));
  });

  getAllClassTypes = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.classTypeService.getAllClassTypes(parsePaginationParams(req.query));

    res.json(successResponse(result.classTypes, { total: result.total }));
  });

  getClassTypeById = asyncHandler(async (req: Request, res: Response) => {
    const classTypeId = parseId(req.params.id, "class type ID");

    const classType = await this.classTypeService.getClassTypeById(classTypeId);
    if (!classType) {
      return res.status(404).json({ error: "Class type not found" });
    }

    res.json(successResponse(classType));
  });

  getClassTypeTrainers = asyncHandler(async (req: Request, res: Response) => {
    const classTypeId = parseId(req.params.id, "class type ID");
    const trainers = await this.classTypeService.getClassTypeTrainers(classTypeId);
    res.json({ ...successResponse(trainers), class_type_id: classTypeId });
  });
}
