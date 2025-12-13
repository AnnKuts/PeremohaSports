import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../middlewares/authenticate";

export const AuthController = {
    async verifyCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.body;

            if (!code) {
                throw new Error("Code is required");
            }

            const payload = authService.verifyActivationCode(code);
            const client = await prisma.client.findUnique({
                where: { client_id: payload.clientId },
                include: { contact_data: true }
            });

            if (!client) {
                throw new Error("Client account not found");
            }

            const token = authService.generateAuthToken(client.client_id, payload.email);

            res.status(200).json({
                success: true,
                token,
                client: {
                    id: client.client_id,
                    firstName: client.first_name,
                    lastName: client.last_name,
                    email: client.contact_data.email
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async requestCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            if (!email) {
                throw new Error("Email is required");
            }

            const contact = await prisma.contact_data.findUnique({
                where: { email },
                include: { client: true }
            });

            if (!contact || !contact.client.length) {
                throw new Error("User not found");
            }

            const client = contact.client[0];
            const payment = await prisma.payment.findFirst({
                where: {
                    client_id: client.client_id,
                    status: 'completed'
                }
            });

            if (!payment) {
                throw new Error("Account not activated. Payment required.");
            }

            const { code } = authService.generateActivationCode(email, client.client_id);
            await authService.sendActivationCode(email, code);

            res.status(200).json({
                success: true,
                message: "If an account exists and is paid, a code has been sent."
            });

        } catch (error) {
            next(error);
        }
    },

    async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error("User not authenticated");
            }
            const client = await prisma.client.findUnique({
                where: { client_id: req.user.clientId },
                include: {
                    contact_data: true,
                    membership: {
                        include: {
                            class_type: true
                        }
                    }
                }
            });

            if (!client) {
                throw new Error("Client not found");
            }

            res.status(200).json({
                success: true,
                user: {
                    id: client.client_id,
                    firstName: client.first_name,
                    lastName: client.last_name,
                    email: client.contact_data.email,
                    phone: client.contact_data.phone,
                    membership: client.membership.map(m => ({
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
        } catch (error) {
            next(error);
        }
    }
};
