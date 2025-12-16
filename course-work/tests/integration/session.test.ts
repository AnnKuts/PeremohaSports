import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../src/app";
import { clearTestData } from "./clearTestData";
import prisma from "../../src/lib/prisma";
import { adminToken, createTrainerToken, clientToken } from "./testHelpers";

let trainerId: number;
let trainerToken: string;
let roomId: number;
let classTypeId: number;
let createdSessionId: number;

describe("Sessions API Integration", () => {
  beforeAll(async () => {
    await clearTestData();



    const gym = await prisma.gym.create({ data: { address: "Session Gym" } });


    const classType = await prisma.class_type.create({ 
      data: { name: "workout", level: "advanced" } 
    });
    classTypeId = classType.class_type_id;


    const room = await prisma.room.create({
      data: { gym_id: gym.gym_id, capacity: 20 }
    });
    roomId = room.room_id;


    await prisma.room_class_type.create({
      data: { room_id: room.room_id, class_type_id: classType.class_type_id }
    });


    const contact = await prisma.contact_data.create({
      data: { email: "trainer@session.com", phone: "555555555" }
    });
    const trainer = await prisma.trainer.create({
      data: {
        first_name: "Fit",
        last_name: "Guy",
        is_admin: false,
        contact_data_id: contact.contact_data_id
      }
    });
    trainerId = trainer.trainer_id;
    trainerToken = createTrainerToken(trainerId, "trainer@session.com");


    await prisma.trainer_placement.create({
      data: { trainer_id: trainerId, gym_id: gym.gym_id }
    });


    await prisma.qualification.create({
      data: { trainer_id: trainerId, class_type_id: classTypeId }
    });
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe("CREATE (POST /sessions)", () => {
    it("should create a session successfully", async () => {
      const payload = {
        trainer_id: trainerId,
        room_id: roomId,
        class_type_id: classTypeId,
        date: new Date().toISOString(),
        duration: "01:00:00",
        capacity: 10
      };

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${trainerToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("session_id");
      expect(res.body.trainer_id).toBe(trainerId);
      
      createdSessionId = res.body.session_id;
    });

    it("should fail if trainer tries to create session for someone else", async () => {
      const otherTrainerToken = createTrainerToken(999, "other@test.com");
      
      const payload = {
        trainer_id: trainerId,
        room_id: roomId,
        class_type_id: classTypeId,
        date: new Date().toISOString(),
        duration: "01:00:00",
        capacity: 10
      };

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${otherTrainerToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/only create sessions for yourself/);
    });

    it("should fail if validation logic fails (e.g. invalid room)", async () => {
      const payload = {
        trainer_id: trainerId,
        room_id: 9999,
        class_type_id: classTypeId,
        date: new Date().toISOString(),
        duration: "01:00:00",
        capacity: 10
      };

      const res = await request(app)
        .post("/sessions")
        .set("Authorization", `Bearer ${trainerToken}`)
        .send(payload);

    
    
      expect([400, 500]).toContain(res.status); 
    });
  });

  describe("READ (GET /sessions)", () => {
    it("should get all sessions", async () => {
      const res = await request(app)
        .get("/sessions")
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get session by id", async () => {
      const res = await request(app)
        .get(`/sessions/${createdSessionId}`)
        .set("Authorization", `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.session_id).toBe(createdSessionId);
    });
  });

  describe("DELETE (DELETE /admin/sessions/:id)", () => {
    it("should fail if not admin", async () => {
      const res = await request(app)
        .delete(`/admin/sessions/${createdSessionId}`)
        .set("Authorization", `Bearer ${trainerToken}`);

      expect(res.status).toBe(403);
    });

    it("should delete session (Admin only)", async () => {
      const res = await request(app)
        .delete(`/admin/sessions/${createdSessionId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/);
    });

    it("should return 404 for deleted session", async () => {
       const res = await request(app)
        .get(`/sessions/${createdSessionId}`)
        .set("Authorization", `Bearer ${clientToken}`);
        
    
    
    
        expect(res.status).toBe(404);
    });
  });
});