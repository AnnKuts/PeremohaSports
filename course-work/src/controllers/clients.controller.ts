import { Request, Response } from "express";
import { clientsService } from "../services/clients.service";

export const ClientsController = {
  getClients: async (req: Request, res: Response) => {
    try {
      const active = req.query.active === "true";
      const clients = await clientsService.getClients(
        req.query.active ? active : undefined
      );
      res.status(200).json(clients);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  getClientById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid client ID" });
        return;
      }
      const client = await clientsService.getClientById(id);
      res.status(200).json(client);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Client not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  getClientMemberships: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid client ID" });
        return;
      }
      const memberships = await clientsService.getClientMemberships(id);
      res.status(200).json(memberships);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Client not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  getClientPayments: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid client ID" });
        return;
      }
      const payments = await clientsService.getClientPayments(id);
      res.status(200).json(payments);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Client not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  getClientAttendance: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid client ID" });
        return;
      }
      const attendance = await clientsService.getClientAttendance(id);
      res.status(200).json(attendance);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Client not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  updateClient: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid client ID" });
        return;
      }
      const client = await clientsService.updateClient(id, req.body);
      res.status(200).json(client);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Client not found") {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
};