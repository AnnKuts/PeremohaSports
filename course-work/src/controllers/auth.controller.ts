import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/async-handler";
import { authService } from "../services/auth.service";
import { emailService } from "../services/email.service";
import { AuthenticatedRequest } from "../middlewares/authenticate";

export const AuthController = {
  requestCode: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const contact = await prisma.contact_data.findUnique({
      where: { email },
      include: { client: true },
    });

    if (!contact || !contact.client.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const client = contact.client[0];

    const payment = await prisma.payment.findFirst({
      where: {
        client_id: client.client_id,
        status: "completed",
      },
    });

    if (!payment) {
      return res.status(403).json({
        success: false,
        message: "Account not activated. Payment required.",
      });
    }

    const { code } = emailService.generateActivationCode(
      email,
      client.client_id
    );

    await emailService.sendActivationEmail(email, code);

    return res.status(200).json({
      success: true,
      message: "If an account exists and is paid, a code has been sent.",
    });
  }),

  verifyCode: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    const payload = emailService.verifyActivationCode(code);

    const client = await prisma.client.findUnique({
      where: { client_id: payload.clientId },
      include: { contact_data: true },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client account not found",
      });
    }

    const token = authService.generateAuthToken(
      client.client_id,
      payload.email
    );

    return res.status(200).json({
      success: true,
      token,
      client: {
        id: client.client_id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.contact_data.email,
      },
    });
  }),

  getMe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const client = await prisma.client.findUnique({
      where: { client_id: req.user.clientId },
      include: {
        contact_data: true,
        membership: {
          include: {
            class_type: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: client.client_id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.contact_data.email,
        phone: client.contact_data.phone,
        membership: client.membership.map((m) => ({
          id: m.membership_id,
          classType: m.class_type.name,
          level: m.class_type.level,
          startDate: m.start_date,
          endDate: m.end_date,
          status: m.status,
          price: m.price,
        })),
      },
    });
  }),
};
