import type { Request, Response } from "express";

import type { RoomService } from "../services/roomServices.js";

import { asyncHandler } from "../utils/async-handler.js";
import { successResponse } from "../utils/responses.js";
import { parseId, parsePaginationParams } from "../utils/validation.js";

export class RoomController {
  constructor(private roomService: RoomService) {}

  createRoom = asyncHandler(async (req: Request, res: Response) => {
    const { capacity, gym_id } = req.body;

    if (!capacity || !gym_id) {
      return res.status(400).json({ error: "Capacity and gym_id are required" });
    }

    const capacityNum = Number.parseInt(capacity);
    const gymIdNum = Number.parseInt(gym_id);

    if (Number.isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({ error: "Invalid capacity" });
    }

    if (Number.isNaN(gymIdNum)) {
      return res.status(400).json({ error: "Invalid gym_id" });
    }

    const room = await this.roomService.createRoom({
      capacity: capacityNum,
      gym_id: gymIdNum,
    });
    res.status(201).json(successResponse(room));
  });

  getAllRooms = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.roomService.getAllRooms(parsePaginationParams(req.query));

    res.json(successResponse(result.rooms, { total: result.total }));
  });

  getRoomById = asyncHandler(async (req: Request, res: Response) => {
    const roomId = parseId(req.params.id, "room ID");

    const room = await this.roomService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(successResponse(room));
  });

  getRoomClassTypes = asyncHandler(async (req: Request, res: Response) => {
    const roomId = parseId(req.params.id, "room ID");
    const classTypes = await this.roomService.getRoomClassTypes(roomId);
    res.json({ ...successResponse(classTypes), room_id: roomId });
  });

  getRoomSessions = asyncHandler(async (req: Request, res: Response) => {
    const roomId = parseId(req.params.id, "room ID");
    const sessions = await this.roomService.getRoomSessions(roomId);
    res.json({ ...successResponse(sessions), room_id: roomId });
  });

  createRoomClassType = asyncHandler(async (req: Request, res: Response) => {
    const { room_id, class_type_id } = req.body;

    if (!room_id || !class_type_id) {
      return res.status(400).json({ error: "room_id and class_type_id are required" });
    }

    const roomIdNum = Number.parseInt(room_id);
    const classTypeIdNum = Number.parseInt(class_type_id);

    if (Number.isNaN(roomIdNum) || Number.isNaN(classTypeIdNum)) {
      return res.status(400).json({ error: "Invalid room_id or class_type_id" });
    }

    const roomClassType = await this.roomService.createRoomClassType(roomIdNum, classTypeIdNum);
    res.status(201).json(successResponse(roomClassType));
  });

  deleteRoom = asyncHandler(async (req: Request, res: Response) => {
    const roomId = parseId(req.params.id, "room ID");

    if (roomId <= 0) {
      return res.status(400).json({
        error: "Invalid room ID",
      });
    }

    try {
      const result = await this.roomService.deleteRoom(roomId);

      res.json(successResponse(result, { message: "Room deleted successfully with cascade deletion" }));
    }
    catch (error) {
      if (error instanceof Error && error.message === "Room not found") {
        return res.status(404).json({ error: "Room not found" });
      }

      throw error;
    }
  });

  updateRoomCapacity = asyncHandler(async (req: Request, res: Response) => {
    const roomId = parseId(req.params.id, "room ID");
    const { capacity } = req.body;

    if (capacity === undefined || capacity === null) {
      return res.status(400).json({
        error: "Capacity is required",
      });
    }

    const capacityNum = Number.parseInt(capacity);
    if (Number.isNaN(capacityNum)) {
      return res.status(400).json({
        error: "Capacity must be a valid number",
      });
    }

    try {
      const result = await this.roomService.updateRoomCapacity(roomId, capacityNum);

      res.json(successResponse(result, { message: "Room capacity updated successfully" }));
    }
    catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("must be")) {
          return res.status(400).json({ error: error.message });
        }
      }

      throw error;
    }
  });

  searchRooms = asyncHandler(async (req: Request, res: Response) => {
    const { min_capacity, max_capacity, gym_id, limit, offset } = req.query;

    const result = await this.roomService.searchRooms({
      minCapacity: min_capacity ? Number.parseInt(min_capacity as string) : undefined,
      maxCapacity: max_capacity ? Number.parseInt(max_capacity as string) : undefined,
      gymId: gym_id ? Number.parseInt(gym_id as string) : undefined,
      limit: limit ? Number.parseInt(limit as string) : undefined,
      offset: offset ? Number.parseInt(offset as string) : undefined,
    });

    res.json(successResponse(result.rooms, { total: result.total }));
  });
}
