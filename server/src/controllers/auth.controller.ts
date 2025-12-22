import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { asyncHandler } from '../utils/async-handler';
import { authService } from '../services/auth.service';
import { emailService } from '../services/email.service';
import { clientsService } from '../services/clients.service';
import { AuthenticatedRequest } from '../middlewares/authenticate';

function okOtpResponse(res: Response) {
  return res.status(200).json({
    success: true,
    message: 'If an account exists, a code has been sent.'
  });
}

async function sendOtp(email: string, actor: 'client' | 'trainer', actorId: number) {
  const { code } = emailService.generateActivationCode({
    email,
    actor,
    actorId
  });

  await emailService.sendActivationEmail(email, code);
}

export const AuthController = {
  requestCode: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const contact = await prisma.contact_data.findUnique({
      where: { email },
      include: {
        client: {
          where: { is_deleted: false }
        },
        trainer: true
      }
    });

    if (!contact) {
      return okOtpResponse(res);
    }

    if (contact.client.length > 0) {
      const client = contact.client[0];

      const payment = await prisma.payment.findFirst({
        where: {
          client_id: client.client_id,
          status: 'completed',
          is_deleted: false
        }
      });

      if (!payment) {
        return okOtpResponse(res);
      }

      await sendOtp(email, 'client', client.client_id);
      return okOtpResponse(res);
    }

    if (contact.trainer.length > 0) {
      const trainer = contact.trainer[0];

      await sendOtp(email, 'trainer', trainer.trainer_id);
      return okOtpResponse(res);
    }

    return okOtpResponse(res);
  }),

  verifyCode: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const payload = emailService.verifyActivationCode(code);

    if (payload.actor === 'client') {
      const client = await prisma.client.findFirst({
        where: { client_id: payload.actorId, is_deleted: false },
        include: { contact_data: true }
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client account not found'
        });
      }

      const token = authService.generateAuthToken(client.client_id, payload.email, 'client');

      return res.status(200).json({
        success: true,
        actor: 'client',
        token,
        data: {
          id: client.client_id,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.contact_data.email
        }
      });
    }

    if (payload.actor === 'trainer') {
      const trainer = await prisma.trainer.findUnique({
        where: { trainer_id: payload.actorId },
        include: { contact_data: true }
      });

      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer account not found'
        });
      }

      const token = authService.generateAuthToken(
        trainer.trainer_id,
        payload.email,
        'trainer',
        trainer.is_admin
      );

      return res.status(200).json({
        success: true,
        actor: 'trainer',
        token,
        data: {
          id: trainer.trainer_id,
          firstName: trainer.first_name,
          lastName: trainer.last_name,
          email: trainer.contact_data.email,
          isAdmin: trainer.is_admin
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid activation code'
    });
  }),

  getMe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (req.user.actor === 'client') {
      const client = await prisma.client.findFirst({
        where: { client_id: req.user.clientId, is_deleted: false },
        include: {
          contact_data: true,
          membership: {
            include: { class_type: true }
          }
        }
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      return res.status(200).json({
        success: true,
        actor: 'client',
        data: {
          id: client.client_id,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.contact_data.email,
          phone: client.contact_data.phone,
          memberships: client.membership.map((m) => ({
            id: m.membership_id,
            classType: m.class_type.name,
            level: m.class_type.level,
            startDate: m.start_date,
            endDate: m.end_date,
            status: m.status,
            price: m.price
          }))
        }
      });
    }

    if (req.user.actor === 'trainer') {
      const trainer = await prisma.trainer.findUnique({
        where: { trainer_id: req.user.trainerId },
        include: {
          contact_data: true,
          qualification: {
            include: { class_type: true }
          },
          trainer_placement: {
            include: { gym: true }
          }
        }
      });

      if (!trainer) {
        return res.status(404).json({
          success: false,
          message: 'Trainer not found'
        });
      }

      return res.status(200).json({
        success: true,
        actor: 'trainer',
        data: {
          id: trainer.trainer_id,
          firstName: trainer.first_name,
          lastName: trainer.last_name,
          email: trainer.contact_data.email,
          isAdmin: trainer.is_admin,
          qualifications: trainer.qualification.map((q) => ({
            classTypeId: q.class_type_id,
            classTypeName: q.class_type.name
          })),
          gyms: trainer.trainer_placement.map((tp) => ({
            gymId: tp.gym_id,
            address: tp.gym.address
          }))
        }
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Unsupported actor type'
    });
  }),

  deleteMe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (req.user.actor !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can delete their account'
      });
    }

    await clientsService.deleteClient(req.user.clientId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  })
};
