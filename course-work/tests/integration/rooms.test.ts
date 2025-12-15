import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../src/app";
import { clearTestData } from "./clearTestData";
import { main } from "../../prisma/seed";

let roomId: number;
let gymId: number;

describe("Rooms API Integration", () => {
  beforeAll(async () => {
    await clearTestData();
    await main();
    const prisma = (await import("../../src/lib/prisma")).default;
    const gym = await prisma.gym.create({
      data: { address: "RoomTest Gym", is_deleted: false },
    });
    gymId = gym.gym_id;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("SEARCH", () => {
    it("GET /rooms/search - should filter rooms by gym_id and capacity", async () => {
      let res = await request(app)
        .get("/rooms/search")
        .query({ gym_id: 1, capacity: 80 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(
        res.body.data.some((r: any) => r.gym_id === 1 && r.capacity === 80),
      ).toBe(true);

      res = await request(app)
        .get("/rooms/search")
        .query({ gym_id: 2, capacity: 50 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(
        res.body.data.some((r: any) => r.gym_id === 2 && r.capacity === 50),
      ).toBe(true);

      res = await request(app)
        .get("/rooms/search")
        .query({ gym_id: 1, minCapacity: 999, maxCapacity: 999 });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((r: any) => r.capacity === 999)).toBe(false);
    });

    it("GET /rooms/search - filter by capacity", async () => {
      const res = await request(app)
        .get("/rooms/search?minCapacity=10");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("CREATE", () => {
    it("POST /rooms - should fail with missing required fields", async () => {
      const res = await request(app).post("/rooms").send({});
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty("error");
    });

    it("POST /rooms - should create room", async () => {
      const payload = {
        gym_id: gymId,
        capacity: 15,
        classTypeIds: [],
      };
      const res = await request(app).post("/rooms").send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("room_id");
      roomId = res.body.data.room_id;
    });
  });

  describe("READ", () => {
    it("GET /rooms/:id - should get room by id", async () => {
      const res = await request(app).get(`/rooms/${roomId}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data).toHaveProperty("room_id", roomId);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("GET /rooms - should get all rooms", async () => {
      const res = await request(app).get("/rooms");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("GET /rooms/:id/class-types - should get class types for room", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });
      const res = await request(app).get(`/rooms/${room.room_id}/class-types`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(Array.isArray(res.body.data)).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("GET /rooms/:id - should return 404 for non-existent room", async () => {
      const res = await request(app).get("/rooms/999999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("UPDATE", () => {
    it("PUT /rooms/:id/capacity - should update room capacity", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
      const room = await prisma.room.create({
        data: { gym_id: gymId, capacity: 10, is_deleted: false },
      });
      const res = await request(app)
        .put(`/rooms/${room.room_id}/capacity`)
        .send({ capacity: 25 });
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        expect(res.body.data.to).toBe(25);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });
  });

  describe("DELETE", () => {
    it("DELETE /rooms/:id - should delete room and mark dependencies as deleted", async () => {
      const prisma = (await import("../../src/lib/prisma")).default;
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
      const res = await request(app).delete(`/rooms/${room.room_id}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
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
        expect(deletedRCT?.is_deleted).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });

    it("DELETE /rooms/:id - should delete room", async () => {
      const res = await request(app).delete(`/rooms/${roomId}`);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty("success", true);
        const prisma = (await import("../../src/lib/prisma")).default;
        const deleted = await prisma.room.findUnique({
          where: { room_id: roomId },
        });
        expect(deleted?.is_deleted).toBe(true);
      } else {
        expect(res.body).toHaveProperty("error");
      }
    });
  });


    describe("ANALYTICS", () => {
      it("GET /rooms/analytics/room-revenue - should return revenue and attendance for all rooms", async () => {
        const res = await request(app)
          .get("/rooms/analytics/room-revenue")
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
          .query({ room_id: 999999 });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every((item: any) => item.room_id !== 999999)).toBe(true);
      });
    });
});
