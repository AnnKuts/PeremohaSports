import { Request, Response } from 'express';
import { membershipsService } from '../services/memberships.service';
import { asyncHandler } from '../utils/async-handler';

export const MembershipsController = {
  getMemberships: asyncHandler(async (req: Request, res: Response) => {
    const result = await membershipsService.getMemberships();
    res.json({ success: true, data: result });
  }),

  getMembershipById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await membershipsService.getMembershipById(id);
    res.json({ success: true, data: result });
  }),

  createMembership: asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const result = await membershipsService.createMembership(data);
    res.status(201).json({ success: true, data: result });
  }),

  updateMembership: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;
    const result = await membershipsService.updateMembership(id, data);
    res.json({ success: true, data: result });
  }),

  getMembershipPayments: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await membershipsService.getMembershipPayments(id);
    res.json({ success: true, data: result });
  }),

  getMembershipsByClient: asyncHandler(async (req: Request, res: Response) => {
    const clientId = Number(req.params.clientId);
    const result = await membershipsService.getMembershipsByClient(clientId);
    res.json({ success: true, data: result });
  }),

  deleteMembership: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await membershipsService.deleteMembership(id);
    res.json({ success: true, data: result });
  })
};
