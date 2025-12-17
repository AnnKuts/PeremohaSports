import request from "supertest";
import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { clearTestData } from "./utils/clearTestData";
import { adminToken } from "./utils/testHelpers";

describe("ClassTypes API Integration", () => {
  beforeEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("CREATE (POST /class-types)", () => {
    it("should create a valid class type", async () => {
      const payload = {
        name: "yoga",
        description: "Relaxing yoga session",
        level: "beginner",
      };

      const res = await request(app)
        .post("/class-types")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("class_type_id");
      expect(res.body.data.name).toBe("yoga");
    });

    it("should fail when required fields are missing", async () => {
      const res = await request(app)
        .post("/class-types")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should fail with invalid enum values", async () => {
      const payload = {
        name: "invalid_sport",
        description: "Test",
        level: "pro_god_mode",
      };

      const res = await request(app)
        .post("/class-types")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("READ (GET /class-types)", () => {
    it("should get all class types", async () => {
      await prisma.class_type.createMany({
        data: [
          { name: "yoga", level: "beginner", description: "A" },
          { name: "workout", level: "advanced", description: "B" },
        ],
      });

      const res = await request(app).get("/class-types");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty("name");
    });

    it("should get class type by ID", async () => {
      const created = await prisma.class_type.create({
        data: { name: "swimming_pool", level: "intermediate", description: "Swim" },
      });

      const res = await request(app).get(`/class-types/${created.class_type_id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.class_type_id).toBe(created.class_type_id);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(app).get("/class-types/999999");
      expect(res.status).toBe(404);
    });
  });

  describe("UPDATE (PUT /class-types/:id)", () => {
    it("should update class type details", async () => {
      const created = await prisma.class_type.create({
        data: { name: "workout", level: "beginner", description: "Old" },
      });


      const res = await request(app)
        .put(`/class-types/${created.class_type_id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "workout", description: "New Description", level: "advanced" });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe("New Description");
      expect(res.body.data.level).toBe("advanced");
    });
  });

  describe("ANALYTICS", () => {
    it("GET /class-types/analytics/monthly-revenue - should return monthly revenue analytics", async () => {
      const res = await request(app)
        .get("/class-types/analytics/monthly-revenue")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("class_category");
        expect(res.body[0]).toHaveProperty("month");
        expect(res.body[0]).toHaveProperty("attendance_count");
        expect(res.body[0]).toHaveProperty("total_revenue");
      }
    });

    it("GET /class-types/analytics/monthly-revenue?months=1&minRevenue=0&minAttendance=0 - should support query params", async () => {
      const res = await request(app)
        .get("/class-types/analytics/monthly-revenue?months=1&minRevenue=0&minAttendance=0")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
