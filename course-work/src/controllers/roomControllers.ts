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

  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = parseInt(req.params.id);
      
      if (isNaN(roomId) || roomId <= 0) {
        return res.status(400).json({ 
          error: 'Invalid room ID' 
        });
      }

      console.log('Controller: Initiating hard delete for room:', roomId);

      const result = await this.roomService.deleteRoom(roomId);

      res.json({ 
        success: true,
        message: 'Room deleted successfully with cascade deletion',
        data: result
      });
    } catch (error) {
      console.error('Controller: Error deleting room:', error);
      
      if (error instanceof Error && error.message === 'Room not found') {
        return res.status(404).json({ error: 'Room not found' });
      }

      next(error);
    }
  };

  updateRoomCapacity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 req.params:', req.params);
      console.log('🔍 req.body:', req.body);
      const roomId = parseInt(req.params.id);
      const { capacity } = req.body;

      if (isNaN(roomId) || capacity === undefined || capacity === null) {
        return res.status(400).json({
          error: 'Valid room ID and capacity are required'
        });
      }

      const capacityNum = parseInt(capacity);
      if (isNaN(capacityNum)) {
        return res.status(400).json({
          error: 'Capacity must be a valid number'
        });
      }

      console.log('🎮 Controller: Updating room capacity');

      const result = await this.roomService.updateRoomCapacity(roomId, capacityNum);

      res.json({
        success: true,
        message: 'Room capacity updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller: Error updating room capacity:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('must be')) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      next(error);
    }
  };  
}
