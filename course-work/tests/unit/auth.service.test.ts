import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { authService } from "../../src/services/auth.service";
import { authConfig } from "../../src/config/auth.config";


vi.mock("../../src/config/auth.config", () => ({
    authConfig: {
        jwt: {
            secret: "test-secret-key-for-unit-tests",
            ttl: "1h",
        },
        otp: {
            hmacSecret: "test-hmac-secret",
            ttl: 900000,
        },
    },
}));

describe("AuthService (unit)", () => {
    describe("generateClientToken", () => {
        it("should generate valid JWT token for client", () => {
            const clientId = 123;
            const email = "client@test.com";

            const token = authService.generateClientToken(clientId, email);

            expect(token).toBeTruthy();
            expect(typeof token).toBe("string");

            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;
            expect(decoded.actor).toBe("client");
            expect(decoded.clientId).toBe(clientId);
            expect(decoded.email).toBe(email);
        });

        it("should include expiration in token", () => {
            const token = authService.generateClientToken(1, "test@test.com");
            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;

            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    describe("generateTrainerToken", () => {
        it("should generate valid JWT token for trainer without admin", () => {
            const trainerId = 456;
            const email = "trainer@test.com";

            const token = authService.generateTrainerToken(trainerId, email, false);

            expect(token).toBeTruthy();
            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;
            expect(decoded.actor).toBe("trainer");
            expect(decoded.trainerId).toBe(trainerId);
            expect(decoded.email).toBe(email);
            expect(decoded.isAdmin).toBe(false);
        });

        it("should generate valid JWT token for admin trainer", () => {
            const trainerId = 789;
            const email = "admin@test.com";

            const token = authService.generateTrainerToken(trainerId, email, true);

            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;
            expect(decoded.actor).toBe("trainer");
            expect(decoded.trainerId).toBe(trainerId);
            expect(decoded.isAdmin).toBe(true);
        });

        it("should default isAdmin to false if not provided", () => {
            const token = authService.generateTrainerToken(1, "test@test.com");
            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;

            expect(decoded.isAdmin).toBe(false);
        });
    });

    describe("generateAuthToken", () => {
        it("should generate client token when actor is 'client'", () => {
            const token = authService.generateAuthToken(1, "client@test.com", "client");
            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;

            expect(decoded.actor).toBe("client");
            expect(decoded.clientId).toBe(1);
        });

        it("should generate trainer token when actor is 'trainer'", () => {
            const token = authService.generateAuthToken(1, "trainer@test.com", "trainer");
            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;

            expect(decoded.actor).toBe("trainer");
            expect(decoded.trainerId).toBe(1);
            expect(decoded.isAdmin).toBe(false);
        });

        it("should default to client token if actor not specified", () => {
            const token = authService.generateAuthToken(1, "test@test.com");
            const decoded = jwt.verify(token, authConfig.jwt.secret) as any;

            expect(decoded.actor).toBe("client");
        });
    });
});
