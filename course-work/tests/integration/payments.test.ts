import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { clearTestData } from "./utils/clearTestData";
import { main as seed } from "../../prisma/seed";
import { adminToken } from "./utils/testHelpers";

describe("Payments API Integration", () => {
    beforeEach(async () => {
        await clearTestData();
        await seed();
    });

    afterAll(async () => {
        await clearTestData();
    });

    it("GET /payments - should return all payments", async () => {
        const res = await request(app)
            .get("/payments")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("GET /payments/:id - should return payment by id", async () => {
        const payment = await prisma.payment.findFirst();
        expect(payment).toBeTruthy();

        const res = await request(app)
            .get(`/payments/${payment!.payment_id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.payment_id).toBe(payment!.payment_id);
    });

    it("GET /payments/:id - should return 404 for non-existent payment", async () => {
        const res = await request(app)
            .get("/payments/999999")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(404);
    });

    describe("ANALYTICS", () => {
        it("GET /payments/analytics/revenue - should return revenue by class type", async () => {
            const res = await request(app)
                .get("/payments/analytics/revenue")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            if (res.body.data.length > 0) {
                expect(res.body.data[0]).toHaveProperty("month");
                expect(res.body.data[0]).toHaveProperty("classTypes");
                expect(res.body.data[0]).toHaveProperty("totalMonthRevenue");
                expect(Array.isArray(res.body.data[0].classTypes)).toBe(true);
            }
        });

        it("GET /payments/analytics/revenue - should support query filters", async () => {
            const res = await request(app)
                .get("/payments/analytics/revenue")
                .query({ year: 2025, month: 12 })
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
