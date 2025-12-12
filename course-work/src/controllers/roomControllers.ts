import type { Response } from "express";

import type { RoomService } from "../services/roomServices.js";
import type { ValidatedRequest } from "../types/requests.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";

export class RoomController {
  constructor(private roomService: RoomService) {}

  createRoom = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { capacity, gym_id } = req.validated?.body || {};
    const room = await this.roomService.createRoom({ capacity, gym_id });
    res.status(201).json(successResponse(room));
  });

  getAllRooms = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { limit, offset, includeStats } = req.validated?.query || {};
    const result = await this.roomService.getAllRooms({ limit, offset, includeStats });
    res.json(successResponse(result.rooms, { total: result.total }));
  });

  getRoomById = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const room = await this.roomService.getRoomById(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(successResponse(room));
  });

  getRoomClassTypes = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const classTypes = await this.roomService.getRoomClassTypes(id);
    res.json({ ...successResponse(classTypes), room_id: id });
  });

  getRoomSessions = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const sessions = await this.roomService.getRoomSessions(id);
    res.json({ ...successResponse(sessions), room_id: id });
  });

  searchRooms = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const filters = req.validated?.query || {};
    const result = await this.roomService.searchRooms(filters);
    res.json(successResponse(result.rooms, { total: result.total }));
  });

  createRoomClassType = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const { class_type_id } = req.validated?.body || {};
    
    try {
      const result = await this.roomService.createRoomClassType(id, class_type_id);
      res.status(201).json(successResponse(result, { message: "Class type associated with room successfully" }));
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({ error: error.message });
      }
      throw error;
    }
  });

  updateRoomCapacity = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const { capacity } = req.validated?.body || {};

    try {
      const result = await this.roomService.updateRoomCapacity(id, capacity);
      res.json(successResponse(result, { message: "Room capacity updated successfully" }));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Cannot reduce capacity") || error.message.includes("must be between")) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("changed by another admin")) {
          return res.status(409).json({ error: error.message });
        }
      }
      throw error;
    }
  });

  deleteRoom = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};

    try {
      const result = await this.roomService.deleteRoom(id);
      res.json(successResponse(result, { message: "Room deleted successfully" }));
    } catch (error) {
      if (error instanceof Error && error.message === "Room not found") {
        return res.status(404).json({ error: "Room not found" });
      }
      throw error;
    }
  });
}