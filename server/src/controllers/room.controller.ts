import type { Response } from 'express';

import type { RoomService } from '../services/room.service';
import type { ValidatedRequest } from '../types/requests.js';

import { asyncHandler } from '../utils/async-handler.js';
import { successResponse } from '../utils/responses.js';
import AppError from '../utils/AppError.js';

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
      throw new AppError('Room not found', 404);
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
    const { room_id, class_type_id } = req.validated?.body || {};
    const result = await this.roomService.createRoomClassType(room_id, class_type_id);
    res
      .status(201)
      .json(successResponse(result, { message: 'Class type associated with room successfully' }));
  });

  updateRoomCapacity = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};
    const { capacity } = req.validated?.body || {};

    const result = await this.roomService.updateRoomCapacity(id, capacity);
    res.json(successResponse(result, { message: 'Room capacity updated successfully' }));
  });

  deleteRoom = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const { id } = req.validated?.params || {};

    const result = await this.roomService.deleteRoom(id);
    res.json(successResponse(result, { message: 'Room deleted successfully' }));
  });

  getRoomRevenueAndAttendance = asyncHandler(async (req: ValidatedRequest, res: Response) => {
    const result = await this.roomService.getRoomRevenueAndAttendance();
    const normalize = (obj: unknown): unknown =>
      JSON.parse(
        JSON.stringify(obj, (k, v) =>
          typeof v === 'bigint'
            ? Number(v)
            : v &&
                typeof v === 'object' &&
                'd' in v &&
                'e' in v &&
                's' in v &&
                typeof v.toString === 'function'
              ? v.toString()
              : v
        )
      );
    res.json(normalize(result));
  });
}
