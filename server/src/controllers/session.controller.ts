import { Request, Response } from 'express';
import { SessionsService } from '../services/session.service';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest, TrainerJwtPayload } from '../middlewares/authenticate';

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

  createSession: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user as TrainerJwtPayload;

    const result = await SessionsService.createSession(req.body, user);

    res.status(201).json(result);
  }),

  deleteSession: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await SessionsService.deleteSession(id);
    res.json({ message: 'Session deleted successfully' });
  })
};
