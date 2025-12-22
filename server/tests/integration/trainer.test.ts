import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../src/app';
import { clearTestData } from './utils/clearTestData';
import prisma from '../../src/lib/prisma';
import { adminToken, createTrainerToken, clientToken } from './utils/testHelpers';

let createdTrainerId: number;
let trainerToken: string;

describe('Trainers API Integration', () => {
  beforeEach(async () => {
    await clearTestData();

    await prisma.gym.create({ data: { gym_id: 1, address: 'Test Gym' } });
    await prisma.class_type.create({
      data: { class_type_id: 1, name: 'yoga', level: 'beginner' }
    });

    const contact = await prisma.contact_data.create({
      data: { email: 'seeded.trainer@test.com', phone: '9876543210' }
    });

    const trainer = await prisma.trainer.create({
      data: {
        first_name: 'Seeded',
        last_name: 'Trainer',
        is_admin: false,
        contact_data_id: contact.contact_data_id
      }
    });
    createdTrainerId = trainer.trainer_id;
    trainerToken = createTrainerToken(createdTrainerId, 'seeded.trainer@test.com');
  });

  afterEach(async () => {
    await clearTestData();
  });

  // describe("CREATE (POST /admin/trainers)", () => {
  //   it("should create a trainer (Admin only)", async () => {
  //     const payload = {
  //       first_name: "John",
  //       last_name: "Doe",
  //       email: "john.doe@test.com",
  //       phone: "1234567890"
  //       // gym_ids: [1],
  //       // class_type_ids: [1]
  //     };

  //     const res = await request(app)
  //       .post("/admin/trainers")
  //       .set("Authorization", `Bearer ${adminToken}`)
  //       .send(payload);

  //     if (res.status !== 201) {
  //       console.log("Create Trainer failed:", res.body);
  //     }
  //     expect(res.status).toBe(201);
  //     expect(res.body).toHaveProperty("trainer_id");
  //     expect(res.body.first_name).toBe(payload.first_name);

  //     createdTrainerId = res.body.trainer_id;

  //     trainerToken = createTrainerToken(createdTrainerId, payload.email);
  //   });

  //   // it("should fail without token", async () => {
  //   //   const res = await request(app).post("/admin/trainers").send({});
  //   //   expect(res.status).toBe(401);
  //   // });

  //   // it("should fail if not admin", async () => {

  //   //   const res = await request(app)
  //   //     .post("/admin/trainers")
  //   //     .set("Authorization", `Bearer ${clientToken}`)
  //   //     .send({});
  //   //   expect(res.status).toBe(403);
  //   // });
  // });

  describe('READ (GET /trainers)', () => {
    it('should get all trainers', async () => {
      const res = await request(app).get('/trainers').set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get trainer by id', async () => {
      const res = await request(app)
        .get(`/trainers/${createdTrainerId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.trainer_id).toBe(createdTrainerId);
      expect(res.body).toHaveProperty('contact_data');
    });
  });

  describe('UPDATE (PATCH /admin/trainers/:id)', () => {
    it('should update own profile (Trainer Owner)', async () => {
      const updatePayload = { first_name: 'Johnny' };

      const res = await request(app)
        .patch(`/admin/trainers/${createdTrainerId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.first_name).toBe('Johnny');
    });

    // it("should fail updating another trainer (Access Denied)", async () => {
    //   const otherTrainerToken = createTrainerToken(999, "other@test.com");

    //   const res = await request(app)
    //     .patch(`/admin/trainers/${createdTrainerId}`)
    //     .set("Authorization", `Bearer ${otherTrainerToken}`)
    //     .send({ first_name: "Hacker" });

    //   expect(res.status).toBe(403);
    // });

    // it("should update any profile if Admin", async () => {
    //   const res = await request(app)
    //     .patch(`/admin/trainers/${createdTrainerId}`)
    //     .set("Authorization", `Bearer ${adminToken}`)
    //     .send({ last_name: "AdminUpdated" });

    //   if (res.status !== 200) {
    //     console.log("Update failed with:", res.body);
    //   }
    //   expect(res.status).toBe(200);
    //   expect(res.body.last_name).toBe("AdminUpdated");
    // });
  });

  // describe("DELETE (DELETE /admin/trainers/:id)", () => {
  //   it("should soft delete trainer (Admin only)", async () => {
  //     const res = await request(app)
  //       .delete(`/admin/trainers/${createdTrainerId}`)
  //       .set("Authorization", `Bearer ${adminToken}`);

  //     expect(res.status).toBe(200);
  //     expect(res.body.message).toMatch(/Soft Deleted/);

  //     const deletedTrainer = await prisma.trainer.findUnique({
  //       where: { trainer_id: createdTrainerId }
  //     });
  //     expect(deletedTrainer?.is_deleted).toBe(true);
  //   });
  // });
});
