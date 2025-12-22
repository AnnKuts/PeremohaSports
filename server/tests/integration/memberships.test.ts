import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { clearTestData } from './utils/clearTestData';
import { main as seed } from '../../prisma/seed';
import { adminToken } from './utils/testHelpers';

describe('Memberships API Integration', () => {
  beforeEach(async () => {
    await clearTestData();
    await seed();
  });

  afterAll(async () => {
    await clearTestData();
  });

  it('GET /memberships - should return all memberships', async () => {
    const res = await request(app).get('/memberships').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /memberships/:id - should return membership by id', async () => {
    const membership = await prisma.membership.findFirst();
    expect(membership).toBeTruthy();

    const res = await request(app)
      .get(`/memberships/${membership!.membership_id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.membership_id).toBe(membership!.membership_id);
  });

  // it("GET /memberships/client/:clientId - should return memberships for client", async () => {
  //     const membership = await prisma.membership.findFirst();
  //     expect(membership).toBeTruthy();
  //
  //     const res = await request(app)
  //         .get(`/memberships/client/${membership!.client_id}`)
  //         .set("Authorization", `Bearer ${adminToken}`);
  //
  //     expect(res.status).toBe(200);
  //     expect(res.body.success).toBe(true);
  //     expect(Array.isArray(res.body.data)).toBe(true);
  //     expect(res.body.data.some((m: any) => m.membership_id === membership!.membership_id)).toBe(true);
  // });

  it('GET /memberships/:id - should return 404 for non-existent membership', async () => {
    const res = await request(app)
      .get('/memberships/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
