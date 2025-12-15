import { Request, Response } from "express";
import { registerService } from "../services/register.service";
import { asyncHandler } from "../utils/async-handler";

export const RegisterController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await registerService.register(req.body);
    res.status(201).json(result);
  })
};