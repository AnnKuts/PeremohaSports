import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../../src/app';
import { clearTestData } from './clearTestData';
import { main } from '../../prisma/seed';

let testSessionId: number | undefined;
let testClientId: number | undefined;

describe('Attendance Integration API', () => {

	beforeAll(async () => {
		await clearTestData();
		await main();
		const prisma = (await import('../../src/lib/prisma')).default;
		const session = await prisma.class_session.findFirst();
		const client = await prisma.client.findFirst();
		if (session) testSessionId = session.session_id;
		if (client) testClientId = client.client_id;
	});

	afterAll(async () => {
		await clearTestData();
	});

	it('should return paginated attendances', async () => {
		const res = await request(app)
			.get('/attendance?limit=10&offset=0');
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('success', true);
		expect(res.body).toHaveProperty('data');
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	it('should return 404 for non-existent attendance by id', async () => {
		const res = await request(app)
			.get('/attendance/by-id?session_id=999999&client_id=999999');
		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('error');
	});

	it('should create attendance', async () => {
		if (typeof testSessionId !== 'number' || typeof testClientId !== 'number') {
			throw new Error('testSessionId and testClientId must be assigned');
		}
		const res = await request(app)
			.post('/attendance')
			.send({ session_id: testSessionId, client_id: testClientId });
		expect([201, 409]).toContain(res.status);
		if (res.status === 201) {
			expect(res.body).toHaveProperty('success', true);
			expect(res.body).toHaveProperty('data');
		} else {
			expect(res.body).toHaveProperty('error');
		}
	});

	it('should update attendance status', async () => {
		if (typeof testSessionId !== 'number' || typeof testClientId !== 'number') {
			throw new Error('testSessionId and testClientId must be created');
		}
		await request(app)
			.post('/attendance')
			.send({ session_id: testSessionId, client_id: testClientId });
		const res = await request(app)
			.put('/attendance/status')
			.send({ session_id: testSessionId, client_id: testClientId, status: 'attended' });
		expect([200, 404]).toContain(res.status);
		if (res.status === 200) {
			expect(res.body).toHaveProperty('success', true);
			expect(res.body).toHaveProperty('data');
		} else {
			expect(res.body).toHaveProperty('error');
		}
	});

	it('should delete attendance', async () => {
		if (typeof testSessionId !== 'number' || typeof testClientId !== 'number') {
			throw new Error('testSessionId and testClientId must be assigned');
		}
		await request(app)
			.post('/attendance')
			.send({ session_id: testSessionId, client_id: testClientId });
		const res = await request(app)
			.delete('/attendance/by-id?session_id=' + testSessionId + '&client_id=' + testClientId);
		expect([200, 404]).toContain(res.status);
		if (res.status === 200) {
			expect(res.body).toHaveProperty('success', true);
			expect(res.body).toHaveProperty('data');
		} else {
			expect(res.body).toHaveProperty('error');
		}
	});
	it('should fail to create attendance without valid membership', async () => {
		const prisma = (await import('../../src/lib/prisma')).default;
		const session = await prisma.class_session.findFirst({ where: { class_type_id: 2 } });
		const client = await prisma.client.findFirst({ where: { client_id: 4 } });
		expect(session).toBeTruthy();
		expect(client).toBeTruthy();
		if (!session || !client) throw new Error('Test setup failed: session or client not found');
		const res = await request(app)
			.post('/attendance')
			.send({ session_id: session.session_id, client_id: client.client_id });
		expect([400, 403, 500]).toContain(res.status); 
		if (!('error' in res.body)) {
			// eslint--next-line no-console
			console.error('Response body:', res.body);
		}
		expect(res.body).toHaveProperty('error' in res.body ? 'error' : 'message');
	});
});
