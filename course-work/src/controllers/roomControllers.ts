import type { NextFunction, Request, Response } from "express";

import type { RoomService } from "../services/roomServices.js";

export class RoomController {
  constructor(private roomService: RoomService) {}

  createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      res.status(201).json({ success: true, data: room });
    }
    catch (error) {
      next(error);
    }
  };

  getAllRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { include_stats, limit, offset } = req.query;
      const result = await this.roomService.getAllRooms({
        includeStats: include_stats !== "false",
        limit: limit ? Number.parseInt(limit as string) : undefined,
        offset: offset ? Number.parseInt(offset as string) : undefined,
      });

      res.json({ success: true, data: result.rooms, total: result.total });
    }
    catch (error) {
      next(error);
    }
  };

  getRoomById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number.parseInt(req.params.id);
      if (Number.isNaN(roomId)) {
        return res.status(400).json({ error: "Invalid room ID" });
      }

      const room = await this.roomService.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json({ success: true, data: room });
    }
    catch (error) {
      next(error);
    }
  };

  getRoomClassTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number.parseInt(req.params.id);
      const classTypes = await this.roomService.getRoomClassTypes(roomId);
      res.json({ success: true, data: classTypes, room_id: roomId });
    }
    catch (error) {
      next(error);
    }
  };

  getRoomSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number.parseInt(req.params.id);
      const sessions = await this.roomService.getRoomSessions(roomId);
      res.json({ success: true, data: sessions, room_id: roomId });
    }
    catch (error) {
      next(error);
    }
  };

  createRoomClassType = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      res.status(201).json({ success: true, data: roomClassType });
    }
    catch (error) {
      next(error);
    }
  };
}
