import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_do_not_use_in_prod';

export interface AuthenticatedRequest extends Request {
    user?: {
        clientId: number;
        email: string;
        role: string;
    };
}

export const authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please provide a valid token.",
            });
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                clientId: number;
                email: string;
                role: string;
            };

            req.user = decoded;
            next();
        } catch (jwtError: any) {
            if (jwtError.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Token expired. Please login again.",
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }
    } catch (error) {
        next(error);
    }
};
