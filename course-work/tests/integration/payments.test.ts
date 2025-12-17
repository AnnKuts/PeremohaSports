import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { clearTestData } from "./utils/clearTestData";
import { main as seed } from "../../prisma/seed";

describe("Payments API Integration", () => {
    beforeEach(async () => {
        await clearTestData();
        await seed();
    });

    afterAll(async () => {
        await clearTestData();
    });

    it("GET /payments - should return all payments", async () => {
        const res = await request(app).get("/payments");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("GET /payments/:id - should return payment by id", async () => {
        const payment = await prisma.payment.findFirst();
        expect(payment).toBeTruthy();

        const res = await request(app).get(`/payments/${payment!.payment_id}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.payment_id).toBe(payment!.payment_id);
    });

    it("GET /payments/:id - should return 404 for non-existent payment", async () => {
        const res = await request(app).get("/payments/999999");
        expect(res.status).toBe(404);
    });
});
