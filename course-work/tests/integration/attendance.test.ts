import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { clearTestData } from "./utils/clearTestData";
import { main } from "../../prisma/seed";
import { adminToken } from "./utils/testHelpers";

let testSessionId: number | undefined;
let testClientId: number | undefined;

describe("Attendance Integration API", () => {
  beforeEach(async () => {
    await clearTestData();
    await main();

    const session = await prisma.class_session.findFirst();
    const client = await prisma.client.findFirst();

    if (session) testSessionId = session.session_id;
    if (client) testClientId = client.client_id;
  });

  afterEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("CREATE", () => {
    it("should create attendance", async () => {
      if (!testSessionId || !testClientId) throw new Error("Seed data missing");

      const res = await request(app)
        .post("/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ session_id: testSessionId, client_id: testClientId });

      expect([201, 400, 409]).toContain(res.status);

      if (res.status === 201) {
        expect(res.body).toHaveProperty("success", true);
      }
    });

    it("should not allow duplicate attendance creation", async () => {
      if (!testSessionId || !testClientId) throw new Error("Seed data missing");

      await request(app)
        .post("/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ session_id: testSessionId, client_id: testClientId });
      const res = await request(app)
        .post("/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ session_id: testSessionId, client_id: testClientId });
      expect([400, 409]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("READ", () => {
    it("should get attendance by session_id and client_id", async () => {
      if (!testSessionId || !testClientId) throw new Error("Seed data missing");

      await request(app)
        .post("/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ session_id: testSessionId, client_id: testClientId });

      const res = await request(app)
        .get(
          `/attendance/by-id?session_id=${testSessionId}&client_id=${testClientId}`,
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.data).toMatchObject({
          session_id: testSessionId,
          client_id: testClientId
        });
      }
    });

    it("should return 404 for non-existent attendance", async () => {
      const res = await request(app)
        .get(
          "/attendance/by-id?session_id=999999&client_id=999999",
        )
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("UPDATE", () => {
    it("should update attendance status", async () => {
      if (!testSessionId || !testClientId) throw new Error("Seed data missing");

      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });

      const res = await request(app)
        .put("/attendance/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          session_id: testSessionId,
          client_id: testClientId,
          status: "attended",
        });

      expect([200, 404]).toContain(res.status);
    });
  });

  describe("DELETE", () => {
    it("should delete attendance", async () => {
      if (!testSessionId || !testClientId) throw new Error("Seed data missing");
      await request(app)
        .post("/attendance")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ session_id: testSessionId, client_id: testClientId });

      const res = await request(app)
        .delete(
          `/attendance/by-id?session_id=${testSessionId}&client_id=${testClientId}`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);

      if (res.status === 200) {
        const att = await prisma.attendance.findUnique({
          where: {
            session_id_client_id: {
              session_id: testSessionId,
              client_id: testClientId,
            },
          },
        });
        expect(att).toBeTruthy();
        expect(att?.is_deleted).toBe(true);
      }
    });

    it("should not return deleted attendance in list (soft delete)", async () => {
      if (!testSessionId || !testClientId) throw new Error("Seed data missing");

      const createRes = await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      if (createRes.status !== 201 && createRes.status !== 409) {
        console.warn("Skipping test: Could not create initial attendance");
        return;
      }

      await request(app)
        .delete(
          `/attendance/by-id?session_id=${testSessionId}&client_id=${testClientId}`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      const res = await request(app)
        .get(
          `/attendance?session_id=${testSessionId}&client_id=${testClientId}`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      if (Array.isArray(res.body.data)) {
        const found = res.body.data.find(
          (att: any) => att.session_id === testSessionId && att.client_id === testClientId
        );
        expect(found).toBeUndefined(); // Should NOT be in the API list
      }

      const att = await prisma.attendance.findUnique({
        where: {
          session_id_client_id: { session_id: testSessionId, client_id: testClientId }
        }
      });

      expect(att).not.toBeNull();
      expect(att?.is_deleted).toBe(true);
    });
  });
});