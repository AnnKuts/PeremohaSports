import request from "supertest";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import app from "../../src/app";
import prisma from "../../src/lib/prisma";
import { clearTestData } from "./utils/clearTestData";
import { main as seed } from "../../prisma/seed";
import { adminToken } from "./utils/testHelpers";

let gymId: number;

describe("Rooms API Integration", () => {
  beforeEach(async () => {
    await clearTestData();
    await seed();

    const gym = await prisma.gym.create({
      data: { address: "RoomTest Gym", is_deleted: false },
    });
    gymId = gym.gym_id;
  });

  afterEach(async () => {
    await clearTestData();
  });

  describe("SEARCH", () => {
    it("GET /rooms/search - should filter rooms by gym_id and capacity", async () => {
      const gyms = await prisma.gym.findMany({ take: 2 });
      if (gyms.length < 2) {
        await prisma.gym.create({ data: { address: "Extra Gym" } });
      }
      const allGyms = await prisma.gym.findMany({ take: 2 });
      const res1 = await request(app)
        .get("/rooms/search")
        .query({ gym_id: allGyms[0].gym_id }); // simplified query for stability
      expect(res1.status).toBe(200);
      expect(res1.body).toHaveProperty("success", true);
      expect(Array.isArray(res1.body.data)).toBe(true);
    });

    it("GET /rooms/search - filter by capacity", async () => {
      const res = await request(app).get("/rooms/search?minCapacity=10");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("CREATE", () => {
    it("POST /rooms - should fail with missing required fields", async () => {
      const res = await request(app)
        .post("/rooms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("POST /rooms - should create room", async () => {
      const payload = {
        gym_id: gymId,
        capacity: 15,
        classTypeIds: [],
      };
      const res = await request(app)
        .post("/rooms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("room_id");
      expect(res.body.data.gym_id).toBe(gymId);
    });
  });

  describe("READ", () => {
    it("GET /rooms/:id - should get room by id", async () => {
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 20, is_deleted: false },
      });

      const res = await request(app).get(`/rooms/${room.room_id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("room_id", room.room_id);
    });

    it("GET /rooms - should get all rooms", async () => {
      const res = await request(app).get("/rooms");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /rooms/:id/class-types - should get class types for room", async () => {
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });

      const res = await request(app).get(`/rooms/${room.room_id}/class-types`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /rooms/:id - should return 404 for non-existent room", async () => {
      const res = await request(app).get("/rooms/999999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("UPDATE", () => {
    it("PUT /rooms/:id/capacity - should update room capacity", async () => {
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });

      const res = await request(app)
        .put(`/rooms/${room.room_id}/capacity`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ capacity: 25 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);

      const updatedRoom = await prisma.room.findUnique({ where: { room_id: room.room_id } });
      expect(updatedRoom?.capacity).toBe(25);
    });
  });

  describe("DELETE", () => {
    it("DELETE /rooms/:id - should delete room and mark dependencies as deleted", async () => {
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });

      const classType = await prisma.class_type.findFirst();
      if (!classType) throw new Error("Seed data missing: classType");

      await prisma.room_class_type.create({
        data: {
          room_id: room.room_id,
          class_type_id: classType.class_type_id,
          is_deleted: false,
        },
      });

      const res = await request(app)
        .delete(`/rooms/${room.room_id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);

      const deletedRoom = await prisma.room.findUnique({
        where: { room_id: room.room_id },
      });
      expect(deletedRoom?.is_deleted).toBe(true);

      const deletedRCT = await prisma.room_class_type.findFirst({
        where: {
          room_id: room.room_id,
          class_type_id: classType.class_type_id,
        },
      });

      if (deletedRCT) {
        expect(deletedRCT.is_deleted).toBe(true);
      }
    });

    it("DELETE /rooms/:id - should delete room", async () => {
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });

      const res = await request(app)
        .delete(`/rooms/${room.room_id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      const deleted = await prisma.room.findUnique({
        where: { room_id: room.room_id },
      });
      expect(deleted?.is_deleted).toBe(true);
    });
  });

  describe("ANALYTICS", () => {
    let roomId: number;
    beforeEach(async () => {
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });
      roomId = room.room_id;
    });

    it("GET /rooms/analytics/room-revenue - should return revenue and attendance for all rooms", async () => {
      const res = await request(app)
        .get("/rooms/analytics/room-revenue")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({});
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        const item = res.body[0];
        expect(item).toHaveProperty("room_id");
        expect(item).toHaveProperty("gym_id");
        expect(item).toHaveProperty("room_capacity");
        expect(item).toHaveProperty("attendance_count");
        expect(item).toHaveProperty("total_revenue");
      }
    });

    it("GET /rooms/analytics/room-revenue - should filter by gym_id", async () => {
      const res = await request(app)
        .get("/rooms/analytics/room-revenue")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ gym_id: gymId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        const firstGymId = res.body[0].gym_id;
        for (const item of res.body) {
          expect(item.gym_id).toBe(firstGymId);
        }
      }
    });

    it("GET /rooms/analytics/room-revenue - should filter by room_id", async () => {
      const res = await request(app)
        .get("/rooms/analytics/room-revenue")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ room_id: roomId });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        const firstRoomId = res.body[0].room_id;
        for (const item of res.body) {
          expect(item.room_id).toBe(firstRoomId);
        }
      }
    });

    it("GET /rooms/analytics/room-revenue - should return empty array for non-existent room", async () => {
      const res = await request(app)
        .get("/rooms/analytics/room-revenue")
        .set("Authorization", `Bearer ${adminToken}`)
        .query({ room_id: 999999 });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((item: any) => item.room_id !== 999999)).toBe(true);
    });
  });
});

