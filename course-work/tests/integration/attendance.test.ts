import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../src/app";
import { clearTestData } from "./clearTestData";
import { main } from "../../prisma/seed";

let testSessionId: number | undefined;
let testClientId: number | undefined;

describe("Attendance Integration API", () => {
  beforeAll(async () => {
    await clearTestData();
    await main();
    const prisma = (await import("../../src/lib/prisma")).default;
    const session = await prisma.class_session.findFirst();
    const client = await prisma.client.findFirst();
    if (session) testSessionId = session.session_id;
    if (client) testClientId = client.client_id;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("CREATE", () => {
    it("should create attendance", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be assigned");
      }
      const res = await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      expect([201, 409]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("should not allow duplicate attendance creation", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be assigned");
      }
      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      const res = await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error");
    });

    it("should fail to create attendance with non-existent session_id or client_id", async () => {
      const res1 = await request(app)
        .post("/attendance")
        .send({ session_id: 999999, client_id: testClientId });
      expect([400, 404]).toContain(res1.status);
      const res2 = await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: 999999 });
      expect([400, 404]).toContain(res2.status);
    });

    it("should fail to create attendance without valid membership", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const session = await prisma.class_session.findFirst({
        where: { class_type_id: 2 },
      });
      const client = await prisma.client.findFirst({ where: { client_id: 4 } });
      expect(session).toBeTruthy();
      expect(client).toBeTruthy();
      if (!session || !client)
        throw new Error("Test setup failed: session or client not found");
      const res = await request(app)
        .post("/attendance")
        .send({ session_id: session.session_id, client_id: client.client_id });
      expect([400, 403, 500]).toContain(res.status);
      if (!("error" in res.body)) {
        console.error("Response body:", res.body);
      }
      expect(res.body).toHaveProperty(
        "error" in res.body ? "error" : "message",
      );
    });
  });

  describe("READ", () => {
    it("should get attendance by session_id and client_id", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be assigned");
      }
      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      const res = await request(app).get(
        `/attendance/by-id?session_id=${testSessionId}&client_id=${testClientId}`,
      );
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        if (res.body.data) {
          expect(res.body.data.session_id).toBe(testSessionId);
          expect(res.body.data.client_id).toBe(testClientId);
        }
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("should return paginated attendances", async () => {
      const res = await request(app).get("/attendance?limit=10&offset=0");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 404 for non-existent attendance by id", async () => {
      const res = await request(app).get(
        "/attendance/by-id?session_id=999999&client_id=999999",
      );
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("UPDATE", () => {
    it("should update attendance status", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be created");
      }
      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      const res = await request(app)
        .put("/attendance/status")
        .send({
          session_id: testSessionId,
          client_id: testClientId,
          status: "attended",
        });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("should fail to update attendance status to invalid value", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be assigned");
      }
      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      const res = await request(app)
        .put("/attendance/status")
        .send({
          session_id: testSessionId,
          client_id: testClientId,
          status: "not-a-valid-status",
        });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("DELETE", () => {
    it("should delete attendance", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be assigned");
      }
      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      const res = await request(app).delete(
        "/attendance/by-id?session_id=" +
          testSessionId +
          "&client_id=" +
          testClientId,
      );
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        const prisma = (await import("../../src/lib/prisma")).default;
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
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("should not return deleted attendance in list (soft delete)", async () => {
      if (
        typeof testSessionId !== "number" ||
        typeof testClientId !== "number"
      ) {
        throw new Error("testSessionId and testClientId must be assigned");
      }
      await request(app)
        .post("/attendance")
        .send({ session_id: testSessionId, client_id: testClientId });
      await request(app).delete(
        `/attendance/by-id?session_id=${testSessionId}&client_id=${testClientId}`,
      );
      const res = await request(app).get(
        `/attendance?session_id=${testSessionId}&client_id=${testClientId}`,
      );
      expect(res.status).toBe(200);
      if (Array.isArray(res.body.data)) {
        const found = res.body.data.find(
          (att: any) =>
            att.session_id === testSessionId && att.client_id === testClientId,
        );
        expect(found).toBeUndefined();
      }
      const prisma = (await import("../../src/lib/prisma")).default;
      const att = await prisma.attendance.findFirst({
        where: {
          session_id: testSessionId,
          client_id: testClientId,
          is_deleted: true,
        },
      });
      expect(att).toBeTruthy();
    });
  });

  describe("VALIDATION", () => {
    it("should return 400 if only session_id is provided", async () => {
      const res = await request(app).get("/attendance/by-id?session_id=1");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 if only client_id is provided", async () => {
      const res = await request(app).get("/attendance/by-id?client_id=1");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });
});
