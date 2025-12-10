import { Request, Response } from "express";
import { membershipsService } from "../services/memberships.service";

export const MembershipsController = {
  getMemberships: async (req: Request, res: Response) => {
    try {
      const memberships = await membershipsService.getMemberships();
      res.status(200).json(memberships);
    } catch (err: unknown) {
      const error = err as Error;
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  getMembershipById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid membership ID" });
        return;
      }
      const membership = await membershipsService.getMembershipById(id);
      res.status(200).json(membership);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Membership not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  getMembershipPayments: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid membership ID" });
        return;
      }
      const payments = await membershipsService.getMembershipPayments(id);
      res.status(200).json(payments);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Membership not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  deleteMembership: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid membership ID" });
        return;
      }
      const membership = await membershipsService.deleteMembership(id);
      res.status(200).json(membership);
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message === "Membership not found") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
};