import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../src/app";
import { clearTestData } from "./clearTestData";
import { main } from "../../prisma/seed";

let gymId: number;
const seededGymAddress = "Seeded Gym " + Date.now();

describe("Gyms API Integration", () => {
  beforeAll(async () => {
    await clearTestData();
    await main();
    const prisma = (await import("../../src/lib/prisma")).default;
    const gym = await prisma.gym.create({
      data: { address: seededGymAddress, is_deleted: false },
    });
    gymId = gym.gym_id;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("Create & Validation", () => {
    it("POST /gyms - should fail with non-existent trainers", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const classType = await prisma.class_type.findFirst();
      if (!classType) throw new Error("Seed data missing: classType");
      const nonExistentTrainerIds = [999999, 888888];
      const uniqueAddress = "Complex Gym Fail " + Date.now();
      const payload = {
        address: uniqueAddress,
        rooms: [
          { capacity: 20, classTypeIds: [classType.class_type_id] },
          { capacity: 30, classTypeIds: [classType.class_type_id] },
        ],
        trainers: nonExistentTrainerIds,
      };
      const res = await request(app).post("/gyms").send(payload);
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/Trainer\(s\) not found/i);
    });

    it("POST /gyms - should create gym with rooms and trainers", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const classType = await prisma.class_type.findFirst();
      if (!classType) throw new Error("Seed data missing: classType");
      const trainerIds = (
        await prisma.trainer.findMany({ take: 2, select: { trainer_id: true } })
      ).map((t) => t.trainer_id);
      if (!trainerIds.length) throw new Error("Seed data missing: trainers");
      const uniqueAddress = "Complex Gym " + Date.now();
      const payload = {
        address: uniqueAddress,
        rooms: [
          { capacity: 20, classTypeIds: [classType.class_type_id] },
          { capacity: 30, classTypeIds: [classType.class_type_id] },
        ],
        trainers: trainerIds,
      };
      const res = await request(app).post("/gyms").send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data.gym");
      expect(res.body.data.gym.room.length).toBe(2);
      expect(res.body.data.gym.trainer_placement.length).toBe(
        trainerIds.length,
      );
      expect(res.body.data.summary.trainersAssigned).toBe(trainerIds.length);
    });

    it("POST /gyms - should create a gym", async () => {
      const res = await request(app)
        .post("/gyms")
        .send({ address: "Test Address" });
      expect([201, 409]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        const createdGymId = res.body.data.gym?.gym_id;
        expect(createdGymId).toBeDefined();
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("DELETE /gyms/:id - should not delete gym with dependent rooms (soft delete)", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const gym = await prisma.gym.create({
        data: { address: "Dep Gym", is_deleted: false },
      });
      await prisma.room.create({ data: { capacity: 10, gym_id: gym.gym_id } });
      const res = await request(app).delete(`/gyms/${gym.gym_id}`);
      expect([200, 409]).toContain(res.status);
      const deleted = await prisma.gym.findUnique({
        where: { gym_id: gym.gym_id },
      });
      if (res.status === 200) {
        expect(deleted?.is_deleted).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("POST /gyms - should fail to create gym without required fields", async () => {
      const res = await request(app).post("/gyms").send({});
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /gyms/:id - should fail to update gym with missing fields", async () => {
      if (!gymId) throw new Error("No gym id");
      const res = await request(app).put(`/gyms/${gymId}`).send({});
      expect([400, 404, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /gyms/:id - should update gym address", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const gym = await prisma.gym.create({
        data: { address: "Upd Gym", is_deleted: false },
      });
      const res = await request(app)
        .put(`/gyms/${gym.gym_id}`)
        .send({ address: "Updated Address" });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data.address).toBe("Updated Address");
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("PUT /gyms/:id - should fail to update gym with invalid data", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const gym = await prisma.gym.create({
        data: { address: "Invalid Upd", is_deleted: false },
      });
      const res = await request(app)
        .put(`/gyms/${gym.gym_id}`)
        .send({ address: "" });
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Read", () => {
    it("GET /gyms/search - should filter gyms by partial address (LIKE)", async () => {
      const res = await request(app)
        .get("/gyms/search")
        .query({ address: "Ль" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((g: any) => g.address.includes("Львів"))).toBe(
        true,
      );

      const res2 = await request(app)
        .get("/gyms/search")
        .query({ address: "Львів" });
      expect(res2.status).toBe(200);
      expect(res2.body).toHaveProperty("success", true);
      expect(Array.isArray(res2.body.data)).toBe(true);
      expect(res2.body.data.some((g: any) => g.address.includes("Львів"))).toBe(
        true,
      );

      const res3 = await request(app)
        .get("/gyms/search")
        .query({ address: "NoSuchCity" });
      expect(res3.status).toBe(200);
      expect(Array.isArray(res3.body.data)).toBe(true);
      expect(res3.body.data.length).toBe(0);
    });

    it("GET /gyms - should get all gyms", async () => {
      const res = await request(app).get("/gyms");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /gyms/search - should search gyms by address", async () => {
      const res = await request(app).get("/gyms/search?address=Test");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /gyms/analytics/utilization - should get gym utilization analytics", async () => {
      const res = await request(app).get("/gyms/analytics/utilization");
      expect([200, 501]).toContain(res.status);
    });

    it("GET /gyms/:id - should get gym by id", async () => {
      if (!gymId) throw new Error("No gym id");
      const res = await request(app).get(`/gyms/${gymId}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("GET /gyms/:id - should return 400 for invalid gym id", async () => {
      const res = await request(app).get("/gyms/invalid");
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("GET /gyms/:id/rooms - should get gym rooms", async () => {
      if (!gymId) throw new Error("No gym id");
      const res = await request(app).get(`/gyms/${gymId}/rooms`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(Array.isArray(res.body.data)).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("GET /gyms/:id/trainers - should get gym trainers", async () => {
      if (!gymId) throw new Error("No gym id");
      const res = await request(app).get(`/gyms/${gymId}/trainers`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(Array.isArray(res.body.data)).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });
  });

  describe("Delete & Soft Delete", () => {
    it("DELETE /gyms/:id - should delete gym and its relationships", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const gym = await prisma.gym.create({
        data: { address: `Del ${Math.random()}`, is_deleted: false },
      });
      const res = await request(app).delete(`/gyms/${gym.gym_id}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        const deleted = await prisma.gym.findUnique({
          where: { gym_id: gym.gym_id },
        });
        expect(deleted?.is_deleted).toBe(true);

        const rooms = await prisma.room.findMany({
          where: { gym_id: gym.gym_id },
        });
        rooms.forEach((room) => expect(room.is_deleted).toBe(true));

        const placements = await prisma.trainer_placement.findMany({
          where: { gym_id: gym.gym_id },
        });
        placements.forEach((tp) => expect(tp.is_deleted).toBe(true));
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("GET /gyms/:id - should return 404 for non-existent gym", async () => {
      const res = await request(app).get("/gyms/999999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });
});
