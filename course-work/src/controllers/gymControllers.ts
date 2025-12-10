import { Request, Response, NextFunction } from 'express';
import { GymService } from '../services/gymServices';

export class GymController {
  constructor(private gymService: GymService) {}

  createGym = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { address } = req.body;
      if (!address?.trim()) {
        return res.status(400).json({ error: 'Address is required' });
      }

      const gym = await this.gymService.createGym({ address: address.trim() });
      res.status(201).json({ success: true, data: gym });
    } catch (error) {
      next(error);
    }
  };

  getAllGyms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { include_stats, limit, offset } = req.query;
      const result = await this.gymService.getAllGyms({
        includeStats: include_stats !== 'false',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      
      res.json({ success: true, data: result.gyms, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  getGymById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gymId = parseInt(req.params.id);
      if (isNaN(gymId)) {
        return res.status(400).json({ error: 'Invalid gym ID' });
      }

      const gym = await this.gymService.getGymById(gymId);
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }

      res.json({ success: true, data: gym });
    } catch (error) {
      next(error);
    }
  };

  getGymRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gymId = parseInt(req.params.id);
      const rooms = await this.gymService.getGymRooms(gymId);
      res.json({ success: true, data: rooms, gym_id: gymId });
    } catch (error) {
      next(error);
    }
  };

  getGymTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gymId = parseInt(req.params.id);
      const trainers = await this.gymService.getGymTrainers(gymId);
      res.json({ success: true, data: trainers, gym_id: gymId });
    } catch (error) {
      next(error);
    }
  };
}