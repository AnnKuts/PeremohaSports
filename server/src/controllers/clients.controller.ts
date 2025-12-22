import { Request, Response } from 'express';
import { clientsService } from '../services/clients.service';
import { asyncHandler } from '../utils/async-handler';

export const ClientsController = {
  getClients: asyncHandler(async (req: Request, res: Response) => {
    const isActive = req.query.active === 'true';
    const result = await clientsService.getClients(isActive);
    res.json(result);
  }),

  getClientById: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await clientsService.getClientById(id);
    res.json(result);
  }),

  getClientMemberships: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await clientsService.getClientMemberships(id);
    res.json(result);
  }),

  getClientPayments: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await clientsService.getClientPayments(id);
    res.json(result);
  }),

  getClientAttendance: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await clientsService.getClientAttendance(id);
    res.json(result);
  }),

  updateClient: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;
    const result = await clientsService.updateClient(id, data);
    res.json(result);
  }),
  deleteClient: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await clientsService.deleteClient(id);
    res.json({ success: true, message: 'Client deleted successfully' });
  })
};
