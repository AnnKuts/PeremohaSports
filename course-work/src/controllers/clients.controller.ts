import { Request, Response, NextFunction } from "express";
import { clientsService } from "../services/clients.service";

export const ClientsController = {
  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive = req.query.active === "true";
      const result = await clientsService.getClients(isActive);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await clientsService.getClientById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getClientMemberships(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await clientsService.getClientMemberships(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getClientPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await clientsService.getClientPayments(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getClientAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await clientsService.getClientAttendance(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const result = await clientsService.updateClient(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};