import { describe, it, expect, beforeEach, afterAll, afterEach } from 'vitest';
import supertest from 'supertest';
import crypto from 'crypto';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { clearTestData } from './utils/clearTestData';
import { emailService } from '../../src/services/email.service';
import { authConfig } from '../../src/config/auth.config';

const request = supertest(app);

type TestUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type TestData = {
  client: TestUser;
  trainer: TestUser;
  clientCode: string;
  trainerCode: string;
};

async function createContactData(email: string, phone: string) {
  return prisma.contact_data.create({
    data: { email, phone }
  });
}

async function createTestClient(
  email: string,
  phone: string,
  withPayment = true,
  isDeleted = false
): Promise<TestUser> {
  const contact = await createContactData(email, phone);

  const client = await prisma.client.create({
    data: {
      first_name: 'Test',
      last_name: 'Client',
      gender: 'male',
      contact_data_id: contact.contact_data_id,
      is_deleted: isDeleted
    }
  });

  if (withPayment) {
    await prisma.payment.create({
      data: {
        client_id: client.client_id,
        amount: 1000,
        status: 'completed',
        method: 'card',
        is_deleted: false
      }
    });
  }

  return {
    id: client.client_id,
    email,
    firstName: client.first_name,
    lastName: client.last_name,
    phone
  };
}

async function createTestTrainer(
  email: string,
  phone: string,
  isAdmin = false,
  isDeleted = false
): Promise<TestUser> {
  const contact = await createContactData(email, phone);

  const trainer = await prisma.trainer.create({
    data: {
      first_name: 'Test',
      last_name: 'Trainer',
      is_admin: isAdmin,
      contact_data_id: contact.contact_data_id,
      is_deleted: isDeleted
    }
  });

  return {
    id: trainer.trainer_id,
    email,
    firstName: trainer.first_name,
    lastName: trainer.last_name,
    phone
  };
}

function generateActivationCode(
  email: string,
  actor: 'client' | 'trainer',
  actorId: number
): string {
  return emailService.generateActivationCode({
    email,
    actor,
    actorId
  }).code;
}

function createExpiredCode(email: string, actor: 'client' | 'trainer', actorId: number): string {
  const validCode = generateActivationCode(email, actor, actorId);
  const decoded = Buffer.from(validCode, 'base64').toString('utf-8');
  const [data] = decoded.split('|');
  const payload = JSON.parse(data);

  payload.expiresAt = Date.now() - 1000;

  const newData = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', authConfig.otp.hmacSecret)
    .update(newData)
    .digest('hex');

  return Buffer.from(`${newData}|${signature}`).toString('base64');
}

async function verifyCodeAndGetToken(code: string): Promise<string> {
  const response = await request.post('/auth/verify-code').send({ code });

  return response.body.token;
}

async function setupTestData(): Promise<TestData> {
  const client = await createTestClient('client@test.com', '+380501234567');
  const trainer = await createTestTrainer('trainer@test.com', '+380501234568');

  return {
    client,
    trainer,
    clientCode: generateActivationCode('client@test.com', 'client', client.id),
    trainerCode: generateActivationCode('trainer@test.com', 'trainer', trainer.id)
  };
}

describe('Auth API Integration Tests', () => {
  let testData: TestData;

  beforeEach(async () => {
    await clearTestData();
    testData = await setupTestData();
  });

  afterEach(async () => {
    await clearTestData();
  });

  describe('POST /auth/request-code', () => {
    it('should return 200 for existing client with completed payment', async () => {
      const response = await request
        .post('/auth/request-code')
        .send({ email: testData.client.email });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'If an account exists, a code has been sent.'
      });
    });

    it('should return 200 for existing trainer', async () => {
      const response = await request
        .post('/auth/request-code')
        .send({ email: testData.trainer.email });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'If an account exists, a code has been sent.'
      });
    });

    it('should return 200 for non-existent email (security by obscurity)', async () => {
      const response = await request
        .post('/auth/request-code')
        .send({ email: 'nonexistent@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If an account exists, a code has been sent.');
    });

    it('should return 200 for client without completed payment', async () => {
      await createTestClient('nopayment@test.com', '+380501234569', false);

      const response = await request
        .post('/auth/request-code')
        .send({ email: 'nopayment@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If an account exists, a code has been sent.');
    });

    it('should not send code for soft-deleted client', async () => {
      const deletedClient = await createTestClient('deleted@test.com', '+380507777777', true, true);

      const response = await request.post('/auth/request-code').send({ email: 'deleted@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If an account exists, a code has been sent.');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request.post('/auth/request-code').send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request.post('/auth/request-code').send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/verify-code', () => {
    it('should successfully verify client code and return JWT token', async () => {
      const response = await request.post('/auth/verify-code').send({ code: testData.clientCode });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        actor: 'client',
        data: {
          id: testData.client.id,
          firstName: testData.client.firstName,
          lastName: testData.client.lastName,
          email: testData.client.email
        }
      });
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('should successfully verify trainer code and return JWT token', async () => {
      const response = await request.post('/auth/verify-code').send({ code: testData.trainerCode });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        actor: 'trainer',
        data: {
          id: testData.trainer.id,
          firstName: testData.trainer.firstName,
          lastName: testData.trainer.lastName,
          email: testData.trainer.email,
          isAdmin: false
        }
      });
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 when code is missing', async () => {
      const response = await request.post('/auth/verify-code').send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid code format', async () => {
      const response = await request.post('/auth/verify-code').send({ code: 'invalid-code' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for expired code', async () => {
      const expiredCode = createExpiredCode(testData.client.email, 'client', testData.client.id);

      const response = await request.post('/auth/verify-code').send({ code: expiredCode });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when client is soft-deleted', async () => {
      await prisma.client.update({
        where: { client_id: testData.client.id },
        data: { is_deleted: true }
      });

      const response = await request.post('/auth/verify-code').send({ code: testData.clientCode });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Client account not found'
      });
    });

    it('should not allow login for deleted client (is_deleted filter)', async () => {
      // Створюємо клієнта з is_deleted = true
      const deletedClient = await createTestClient(
        'deleted@test.com',
        '+380501111111',
        true,
        true // is_deleted = true
      );

      const code = generateActivationCode('deleted@test.com', 'client', deletedClient.id);

      const response = await request.post('/auth/verify-code').send({ code });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Client account not found');
    });
  });

  describe('GET /auth/me', () => {
    let clientToken: string;
    let trainerToken: string;

    beforeEach(async () => {
      clientToken = await verifyCodeAndGetToken(testData.clientCode);
      trainerToken = await verifyCodeAndGetToken(testData.trainerCode);
    });

    it('should return client data with valid token', async () => {
      const response = await request.get('/auth/me').set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        actor: 'client',
        data: {
          id: testData.client.id,
          firstName: testData.client.firstName,
          lastName: testData.client.lastName,
          email: testData.client.email,
          phone: testData.client.phone,
          memberships: []
        }
      });
    });

    it('should return trainer data with valid token', async () => {
      const response = await request.get('/auth/me').set('Authorization', `Bearer ${trainerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        actor: 'trainer',
        data: {
          id: testData.trainer.id,
          firstName: testData.trainer.firstName,
          lastName: testData.trainer.lastName,
          email: testData.trainer.email,
          isAdmin: false,
          qualifications: [],
          gyms: []
        }
      });
    });

    it('should return client with memberships', async () => {
      const classType = await prisma.class_type.create({
        data: {
          name: 'yoga',
          level: 'beginner',
          description: 'Test yoga class'
        }
      });

      await prisma.membership.create({
        data: {
          client_id: testData.client.id,
          class_type_id: classType.class_type_id,
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          price: 500,
          status: 'active'
        }
      });

      const response = await request.get('/auth/me').set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.memberships).toHaveLength(1);
      expect(response.body.data.memberships[0]).toMatchObject({
        classType: 'yoga',
        level: 'beginner',
        status: 'active'
      });
    });

    it('should return trainer with qualifications and gyms', async () => {
      const classType = await prisma.class_type.create({
        data: {
          name: 'workout',
          level: 'intermediate'
        }
      });

      const gym = await prisma.gym.create({
        data: {
          address: 'Test Street, 123'
        }
      });

      await prisma.qualification.create({
        data: {
          trainer_id: testData.trainer.id,
          class_type_id: classType.class_type_id
        }
      });

      await prisma.trainer_placement.create({
        data: {
          trainer_id: testData.trainer.id,
          gym_id: gym.gym_id
        }
      });

      const response = await request.get('/auth/me').set('Authorization', `Bearer ${trainerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.qualifications).toHaveLength(1);
      expect(response.body.data.qualifications[0]).toMatchObject({
        classTypeId: classType.class_type_id,
        classTypeName: 'workout'
      });
      expect(response.body.data.gyms).toHaveLength(1);
      expect(response.body.data.gyms[0]).toMatchObject({
        gymId: gym.gym_id,
        address: 'Test Street, 123'
      });
    });

    it('should return 401 without token', async () => {
      const response = await request.get('/auth/me');
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request.get('/auth/me').set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      const response = await request.get('/auth/me').set('Authorization', 'InvalidHeaderFormat');

      expect(response.status).toBe(401);
    });

    it('should return 404 when client is deleted after token issued', async () => {
      await prisma.client.update({
        where: { client_id: testData.client.id },
        data: { is_deleted: true }
      });

      const response = await request.get('/auth/me').set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Client not found');
    });
  });

  describe('POST /auth/login (alias for request-code)', () => {
    it('should work as alias for request-code endpoint', async () => {
      const response = await request.post('/auth/login').send({ email: testData.client.email });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('If an account exists, a code has been sent.');
    });
  });

  describe('Full authentication flow', () => {
    async function testFullAuthFlow(
      email: string,
      code: string,
      expectedActor: 'client' | 'trainer'
    ) {
      // 1. Request code
      const requestResponse = await request.post('/auth/request-code').send({ email });
      expect(requestResponse.status).toBe(200);

      // 2. Verify code
      const verifyResponse = await request.post('/auth/verify-code').send({ code });
      expect(verifyResponse.status).toBe(200);

      const token = verifyResponse.body.token;

      // 3. Access protected route
      const meResponse = await request.get('/auth/me').set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.data.email).toBe(email);
      expect(meResponse.body.actor).toBe(expectedActor);

      return meResponse.body;
    }

    it('should complete full client authentication flow', async () => {
      const result = await testFullAuthFlow(testData.client.email, testData.clientCode, 'client');

      expect(result.data.memberships).toBeDefined();
    });

    it('should complete full trainer authentication flow', async () => {
      const result = await testFullAuthFlow(
        testData.trainer.email,
        testData.trainerCode,
        'trainer'
      );

      expect(result.data.isAdmin).toBe(false);
      expect(result.data.qualifications).toBeDefined();
      expect(result.data.gyms).toBeDefined();
    });
  });

  describe('DELETE /auth/me (soft delete)', () => {
    let clientToken: string;

    beforeEach(async () => {
      clientToken = await verifyCodeAndGetToken(testData.clientCode);
    });

    it('should soft delete client account', async () => {
      const response = await request
        .delete('/auth/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Account deleted successfully'
      });

      const client = await prisma.client.findUnique({
        where: { client_id: testData.client.id }
      });

      expect(client?.is_deleted).toBe(true);
    });

    it('should not allow access after soft delete', async () => {
      await request.delete('/auth/me').set('Authorization', `Bearer ${clientToken}`);

      const response = await request.get('/auth/me').set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Client not found');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request.delete('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 403 when trainer tries to delete account', async () => {
      const trainerToken = await verifyCodeAndGetToken(testData.trainerCode);

      const response = await request
        .delete('/auth/me')
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Only clients can delete their account'
      });
    });

    it('should cascade soft delete to related entities', async () => {
      const classType = await prisma.class_type.create({
        data: {
          name: 'yoga',
          level: 'beginner'
        }
      });

      const membership = await prisma.membership.create({
        data: {
          client_id: testData.client.id,
          class_type_id: classType.class_type_id,
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          price: 500,
          status: 'active'
        }
      });

      await request.delete('/auth/me').set('Authorization', `Bearer ${clientToken}`);

      const deletedMembership = await prisma.membership.findUnique({
        where: { membership_id: membership.membership_id }
      });

      expect(deletedMembership?.status).toBe('cancelled');
    });
  });
});
