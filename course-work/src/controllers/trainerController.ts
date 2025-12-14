import { Request, Response } from "express";
import { TrainersService } from "../services/trainerService";
import { asyncHandler } from "../utils/async-handler";

export const TrainersController = {
  getAllTrainers: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.getAllTrainers();
    res.json(result);
  }),

  getTrainerById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await TrainersService.getTrainerById(id);
    res.json(result);
  }),

  createTrainer: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.createTrainer(req.body);
    res.status(201).json(result);
  }),

  updateTrainer: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await TrainersService.updateTrainer(id, req.body);
    res.json(result);
  }),

    deleteTrainer: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await TrainersService.deleteTrainer(id);
    res.json({ message: "Trainer deactivated (Soft Deleted)" });
  }),

  getTrainerGyms: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.getTrainerGyms(Number(req.params.id));
    res.json(result);
  }),

  getTrainerQualifications: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.getTrainerQualifications(Number(req.params.id));
    res.json(result);
  }),

  getTrainerSessions: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.getTrainerSessions(Number(req.params.id));
    res.json(result);
  }),

    getTopTrainer: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.getTopTrainer();
    res.json(result);
  }),

   getPopularTrainers: asyncHandler(async (req: Request, res: Response) => {
    const result = await TrainersService.getPopularTrainers();
    res.json(result);
  }),

  getTrainerWorkload: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await TrainersService.getTrainerWorkloadStats(id);
    res.json(result);
  }),
};