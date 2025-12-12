import { Request, Response, NextFunction } from "express";
import { membershipsService } from "../services/memberships.service";

export const MembershipsController = {
  async getMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await membershipsService.getMemberships();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMembershipById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await membershipsService.getMembershipById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async createMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const result = await membershipsService.createMembership(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const result = await membershipsService.updateMembership(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMembershipPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await membershipsService.getMembershipPayments(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await membershipsService.deleteMembership(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};