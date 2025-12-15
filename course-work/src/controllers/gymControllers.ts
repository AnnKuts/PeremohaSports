import type { Response } from "express";
import { Prisma } from "@prisma/client";

import type { GymService } from "../services/gymServices.js";
import type { ValidatedRequest } from "../types/requests.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";

export class GymController {
  constructor(private gymService: GymService) {}

  createGym = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { address, rooms, trainers } = req.validated?.body || {};

    try {
      const result = await this.gymService.createGym({
        address: address.trim(),
        rooms,
        trainerIds: trainers,
      });

      const message = result.creationType === "simple"
        ? "Simple gym created successfully"
        : "Complete gym created successfully";

      res.status(201).json(successResponse(result, { message }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(409).json({
            message: "Validation failed",
            errors: [{
              field: "address",
              message: `Gym with this address "${address.trim()}" already exists`
            }]
          });
        }
      }
      throw error; 
    }
  });

  getAllGyms = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { limit, offset, includeStats } = req.validated?.query || {};
    const result = await this.gymService.getAllGyms({ limit, offset, includeStats });
    res.json(successResponse(result.gyms, { total: result.total }));
  });

  getGymById = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};

    const gym = await this.gymService.getGymById(id);
    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    res.json(successResponse(gym));
  });

  getGymRooms = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const rooms = await this.gymService.getGymRooms(id);
    res.json({ ...successResponse(rooms), gym_id: id });
  });

  getGymTrainers = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const trainers = await this.gymService.getGymTrainers(id);
    res.json({ ...successResponse(trainers), gym_id: id });
  });

  deleteGym = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};

    try {
      const result = await this.gymService.deleteGym(id);
      res.json(successResponse(result, { message: "Gym deleted successfully with cascade deletion" }));
    }
    catch (error) {
      if (error instanceof Error && error.message === "Gym not found") {
        return res.status(404).json({ error: "Gym not found" });
      }
      throw error;
    }
  });

  searchGyms = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { address, limit, offset } = req.validated?.query || {};
    const result = await this.gymService.searchGymsByAddress(address, { limit, offset });
    res.json(successResponse(result.gyms, { total: result.total }));
  });

  getGymUtilizationAnalysis = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const result = await this.gymService.getGymUtilizationAnalysis();
    res.json(successResponse(result, { message: "Gym utilization analysis" }));
  });
}
