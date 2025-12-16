import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../src/app";
import { clearTestData } from "./clearTestData";
import { main } from "../../prisma/seed";

let createdClassTypeId: number;

describe("ClassTypes API Integration", () => {
  beforeAll(async () => {
    await clearTestData();
    await main();
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("CREATE", () => {
    it("POST /class-types - should create class type", async () => {
      const payload = {
        name: "workout",
        description: "Test workout",
        level: "beginner",
      };
      const res = await request(app).post("/class-types").send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("class_type_id");
      createdClassTypeId = res.body.data.class_type_id;
    });

    it("POST /class-types - should fail with missing required fields", async () => {
      const res = await request(app).post("/class-types").send({});
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("POST /class-types - should fail with invalid enum level", async () => {
      const res = await request(app)
        .post("/class-types")
        .send({ name: "workout", description: "desc", level: "invalid_level" });
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("READ", () => {
    it("GET /class-types - should get all class types", async () => {
      const res = await request(app).get("/class-types");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /class-types/:id - should get class type by id", async () => {
      const res = await request(app).get(`/class-types/${createdClassTypeId}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty(
          "class_type_id",
          createdClassTypeId,
        );
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("GET /class-types/abc - should fail with invalid id", async () => {
      const res = await request(app).get("/class-types/abc");
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("GET /class-types/-1 - should fail with negative id", async () => {
      const res = await request(app).get("/class-types/-1");
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /class-types/:id - should update class type", async () => {
      const updatePayload = {
        name: "yoga",
        description: "Updated description",
        level: "intermediate",
      };
      const res = await request(app)
        .put(`/class-types/${createdClassTypeId}`)
        .send(updatePayload);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("name", updatePayload.name);
        expect(res.body.data).toHaveProperty(
          "description",
          updatePayload.description,
        );
        expect(res.body.data).toHaveProperty("level", updatePayload.level);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("PUT /class-types/:id - should fail with invalid enum level", async () => {
      const res = await request(app)
        .put(`/class-types/${createdClassTypeId}`)
        .send({ level: "invalid_level" });
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /class-types/:id - should fail with invalid id", async () => {
      const res = await request(app)
        .put("/class-types/abc")
        .send({ name: "workout" });
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /class-types/:id - should fail with negative id", async () => {
      const res = await request(app)
        .put("/class-types/-1")
        .send({ name: "workout" });
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /class-types/:id - should allow partial update", async () => {
      const res = await request(app)
        .put(`/class-types/${createdClassTypeId}`)
        .send({ level: "advanced" });
      expect([200, 404, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("level", "advanced");
      }
    });

    it("GET /class-types/:id - should return 404 for non-existent class type", async () => {
      const res = await request(app).get("/class-types/999999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("TRAINERS", () => {
    it("GET /class-types/:id/trainers - should get trainers for class type", async () => {
      const res = await request(app).get(
        `/class-types/${createdClassTypeId}/trainers`,
      );
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(Array.isArray(res.body.data)).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });
  });

  describe("ANALYTICS", () => {
    it("GET /class-types/analytics/monthly-revenue - should return monthly revenue analytics", async () => {
      const res = await request(app).get("/class-types/analytics/monthly-revenue");
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
      const res = await request(app).get("/class-types/analytics/monthly-revenue?months=1&minRevenue=0&minAttendance=0");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("DELETE", () => {
    it("DELETE /class-types/:id - should soft-delete class type and cascade", async () => {
      const payload = {
        name: "yoga",
        description: "To be deleted",
        level: "beginner",
      };
      const createRes = await request(app).post("/class-types").send(payload);
      expect(createRes.status).toBe(201);
      const idToDelete = createRes.body.data.class_type_id;

      const delRes = await request(app).delete(`/class-types/${idToDelete}`);
      expect([200, 404]).toContain(delRes.status);
      if (delRes.status === 200) {
        expect(delRes.body).toHaveProperty("success", true);
        expect(delRes.body.data).toHaveProperty("is_deleted", true);
      }

      const getRes = await request(app).get(`/class-types/${idToDelete}`);
      expect(getRes.status).toBe(404);

      const prisma = (await import("../../src/lib/prisma")).default;
      const quals = await prisma.qualification.findMany({ where: { class_type_id: idToDelete } });
      for (const q of quals) {
        expect(q.is_deleted).toBe(true);
      }

      const rcts = await prisma.room_class_type.findMany({ where: { class_type_id: idToDelete } });
      for (const rct of rcts) {
        expect(rct.is_deleted).toBe(true);
      }

      const memberships = await prisma.membership.findMany({ where: { class_type_id: idToDelete } });
      for (const m of memberships) {
        expect(m.status).toBe("frozen");
      }

      const sessions = await prisma.class_session.findMany({ where: { class_type_id: idToDelete } });
      for (const s of sessions) {
        expect(s.is_deleted).toBe(true);
        const atts = await prisma.attendance.findMany({ where: { session_id: s.session_id } });
        for (const att of atts) {
          expect(att.is_deleted).toBe(true);
          expect(att.status).toBe("cancelled");
        }
      }
    });
  });
});
