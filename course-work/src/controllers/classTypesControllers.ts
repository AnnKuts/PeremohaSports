import type { NextFunction, Request, Response } from "express";

import type { ClassTypeService } from "../services/classTypesServices.js";

export class ClassTypeController {
  constructor(private classTypeService: ClassTypeService) {}

  createClassType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, level } = req.body;

      if (!name?.trim() || !level?.trim()) {
        return res.status(400).json({ error: "Name and level are required" });
      }

      const classType = await this.classTypeService.createClassType({
        name: name.trim(),
        description: description?.trim(),
        level: level.trim(),
      });
      res.status(201).json({ success: true, data: classType });
    }
    catch (error) {
      next(error);
    }
  };

  getAllClassTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { include_stats, limit, offset } = req.query;
      const result = await this.classTypeService.getAllClassTypes({
        includeStats: include_stats !== "false",
        limit: limit ? Number.parseInt(limit as string) : undefined,
        offset: offset ? Number.parseInt(offset as string) : undefined,
      });

      res.json({ success: true, data: result.classTypes, total: result.total });
    }
    catch (error) {
      next(error);
    }
  };

  getClassTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classTypeId = Number.parseInt(req.params.id);
      if (Number.isNaN(classTypeId)) {
        return res.status(400).json({ error: "Invalid class type ID" });
      }

      const classType = await this.classTypeService.getClassTypeById(classTypeId);
      if (!classType) {
        return res.status(404).json({ error: "Class type not found" });
      }

      res.json({ success: true, data: classType });
    }
    catch (error) {
      next(error);
    }
  };

  getClassTypeTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classTypeId = Number.parseInt(req.params.id);
      const trainers = await this.classTypeService.getClassTypeTrainers(classTypeId);
      res.json({ success: true, data: trainers, class_type_id: classTypeId });
    }
    catch (error) {
      next(error);
    }
  };
}
