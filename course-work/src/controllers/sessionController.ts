import { Request, Response } from "express";
import { SessionsService } from "../services/sessionService";
import { asyncHandler } from "../utils/async-handler";

export const SessionsController = {
  getAllSessions: asyncHandler(async (req: Request, res: Response) => {
    const result = await SessionsService.getAllSessions();
    res.json(result);
  }),

  getSessionById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    
    const result = await SessionsService.getSessionById(id);
    
    res.json(result);
  }),
};