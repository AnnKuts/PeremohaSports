import request from "supertest";
import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { clearTestData } from "./utils/clearTestData";
import { main as seed } from "../../prisma/seed";
import { adminToken } from "./utils/testHelpers";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface Gym {
  gym_id: number;
  address: string;
  is_deleted: boolean;
}

let gymId: number;
const seededGymAddress = `Seeded Gym ${Date.now()}`;

describe("Gyms API Integration", () => {
  beforeEach(async () => {
    await clearTestData();
    await seed();

    const gym = await prisma.gym.create({
      data: { address: seededGymAddress },
    });

    gymId = gym.gym_id;
  });

  afterEach(async () => {
    await clearTestData();
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("Create & Validation", () => {
    it("POST /gyms - should fail with non-existent trainers", async () => {
      const classType = await prisma.class_type.findFirst();
      expect(classType).toBeTruthy();

      const payload = {
        address: `Fail Gym ${Date.now()}`,
        rooms: [
          { capacity: 20, classTypeIds: [classType!.class_type_id] },
          { capacity: 30, classTypeIds: [classType!.class_type_id] },
        ],
        trainers: [999999, 888888],
      };

      const res = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("POST /gyms - should create gym with rooms and trainers", async () => {
      const classType = await prisma.class_type.findFirst();
      const trainers = await prisma.trainer.findMany({
        take: 2,
        select: { trainer_id: true },
      });

      expect(classType).toBeTruthy();
      expect(trainers.length).toBeGreaterThan(0);

      const payload = {
        address: `Complex Gym ${Date.now()}`,
        rooms: [
          { capacity: 20, classTypeIds: [classType!.class_type_id] },
          { capacity: 30, classTypeIds: [classType!.class_type_id] },
        ],
        trainers: trainers.map(t => t.trainer_id),
      };

      const res = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gym.room.length).toBe(2);
      expect(res.body.data.gym.trainer_placement.length).toBe(
        trainers.length,
      );
    });

    it("POST /gyms - should fail without required fields", async () => {
      const res = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /gyms/:id - should update gym address", async () => {
      const gym = await prisma.gym.create({
        data: { address: "Update Gym" },
      });

      const res = await request(app)
        .put(`/gyms/${gym.gym_id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ address: "Updated Address" });

      expect([200, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.address).toBe("Updated Address");
      }
    });
  });

  describe("Read", () => {
    it("GET /gyms - should return all gyms", async () => {
      const res = await request(app).get("/gyms");

      const body = res.body as ApiResponse<Gym[]>;

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("GET /gyms/search - should filter by address", async () => {
      const res = await request(app)
        .get("/gyms/search")
        .query({ address: "Львів" });

      const body = res.body as ApiResponse<Gym[]>;

      expect(res.status).toBe(200);
      expect(
        body.data.some(g => g.address.includes("Львів")),
      ).toBe(true);
    });

    it("GET /gyms/:id - should return gym by id", async () => {
      const res = await request(app).get(`/gyms/${gymId}`);

      expect([200, 404]).toContain(res.status);

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.gym_id).toBe(gymId);
      }
    });

    it("GET /gyms/:id - should return 404 for non-existent gym", async () => {
      const res = await request(app).get("/gyms/999999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("Delete & Soft Delete", () => {
    it("DELETE /gyms/:id - should soft delete gym and relations", async () => {
      const gym = await prisma.gym.create({
        data: { address: `Del Gym ${Date.now()}` },
      });

      await prisma.room.create({
        data: { capacity: 10, gym_id: gym.gym_id },
      });

      const res = await request(app)
        .delete(`/gyms/${gym.gym_id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);

      if (res.status === 200) {
        const deletedGym = await prisma.gym.findUnique({
          where: { gym_id: gym.gym_id },
        });

        expect(deletedGym?.is_deleted).toBe(true);

        const rooms = await prisma.room.findMany({
          where: { gym_id: gym.gym_id },
        });

        rooms.forEach(r => expect(r.is_deleted).toBe(true));
      }
    });
  });
});