import type { Request, Response } from "express";

import type { GymService } from "../services/gymServices.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";
import { parseId, parsePaginationParams } from "../utils/validation.js";

export class GymController {
  constructor(private gymService: GymService) {}

  createGym = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.body;
    if (!address?.trim()) {
      return res.status(400).json({ error: "Address is required" });
    }

    const gym = await this.gymService.createGym({ address: address.trim() });
    res.status(201).json(successResponse(gym));
  });

  getAllGyms = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.gymService.getAllGyms(parsePaginationParams(req.query));
    res.json(successResponse(result.gyms, { total: result.total }));
  });

  getGymById = asyncHandler(async (req: Request, res: Response) => {
    const gymId = parseId(req.params.id, "gym ID");

    const gym = await this.gymService.getGymById(gymId);
    if (!gym) {
      return res.status(404).json({ error: "Gym not found" });
    }

    res.json(successResponse(gym));
  });

  getGymRooms = asyncHandler(async (req: Request, res: Response) => {
    const gymId = parseId(req.params.id, "gym ID");
    const rooms = await this.gymService.getGymRooms(gymId);
    res.json({ ...successResponse(rooms), gym_id: gymId });
  });

  getGymTrainers = asyncHandler(async (req: Request, res: Response) => {
    const gymId = parseId(req.params.id, "gym ID");
    const trainers = await this.gymService.getGymTrainers(gymId);
    res.json({ ...successResponse(trainers), gym_id: gymId });
  });

  deleteGym = asyncHandler(async (req: Request, res: Response) => {
    const gymId = parseId(req.params.id, "gym ID");

    if (gymId <= 0) {
      return res.status(400).json({
        error: "Invalid gym ID",
      });
    }

    try {
      const result = await this.gymService.deleteGym(gymId);
      res.json(successResponse(result, { message: "Gym deleted successfully with cascade deletion" }));
    }
    catch (error) {
      if (error instanceof Error && error.message === "Gym not found") {
        return res.status(404).json({ error: "Gym not found" });
      }
      throw error;
    }
  });

  searchGyms = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;

    if (!search || typeof search !== "string") {
      return res.status(400).json({ error: "Search term is required" });
    }

    const { limit, offset } = parsePaginationParams(req.query);
    const result = await this.gymService.searchGymsByAddress(search, { limit, offset });

    res.json(successResponse(result.gyms, { total: result.total }));
  });
}
