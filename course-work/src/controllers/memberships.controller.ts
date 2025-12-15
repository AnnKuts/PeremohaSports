import { Request, Response } from "express";
import { membershipsService } from "../services/memberships.service";
import { asyncHandler } from "../utils/async-handler";

export const MembershipsController = {
  getMemberships: asyncHandler(async (req: Request, res: Response) => {
    const result = await membershipsService.getMemberships();
    res.json(result);
  }),

  getMembershipById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await membershipsService.getMembershipById(id);
    res.json(result);
  }),

  createMembership: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const result = await membershipsService.createMembership(data);
    res.status(201).json(result);
  }),

  updateMembership: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;
    const result = await membershipsService.updateMembership(id, data);
    res.json(result);
  }),

  getMembershipPayments: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await membershipsService.getMembershipPayments(id);
    res.json(result);
  }),

  deleteMembership: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await membershipsService.deleteMembership(id);
    res.json(result);
  }),
};