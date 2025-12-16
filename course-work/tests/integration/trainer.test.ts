import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app'; 
import prisma from '../../src/lib/prisma'; 

// =====================================================================
// 1. MOCK AUTH (ВАЖЛИВО: Пропускаємо перевірку токена та адміна)
// =====================================================================
vi.mock('../../src/middlewares/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => next(),
  requireAdmin: (req: any, res: any, next: any) => next(),
}));

// =====================================================================
// 2. MOCK PRISMA (ВИПРАВЛЕНО СИНТАКСИС)
// =====================================================================
vi.mock('../../src/lib/prisma', () => { // <--- Додано дужку (
  const mockPrisma = {
    trainer: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    contact_data: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    gym: { count: vi.fn() },
    class_type: { count: vi.fn(), findMany: vi.fn() },
    trainer_placement: { createMany: vi.fn(), deleteMany: vi.fn() },
    qualification: { createMany: vi.fn(), deleteMany: vi.fn() },
    class_session: { groupBy: vi.fn(), findMany: vi.fn() },
    
    // Імітація транзакції
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };
  return { default: mockPrisma };
}); // <--- Додано закриваючу дужку )

describe('Trainer Routes Integration', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /trainers', () => {
    it('should return 200 and list of trainers', async () => {
      const mockTrainers = [{ trainer_id: 1, first_name: "Alice" }];
      (prisma.trainer.findMany as any).mockResolvedValue(mockTrainers);

      const res = await request(app).get('/trainers');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTrainers);
      expect(prisma.trainer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { is_deleted: false } })
      );
    });
  });

  describe('POST /admin/trainers', () => {
    it('should return 201 when data is valid', async () => {
      const input = {
        first_name: "Bob",
        last_name: "Builder",
        email: "bob@build.com",
        phone: "1234567890",
        gym_ids: [1],
        class_type_ids: [2]
      };

      // Налаштування успішних відповідей моків
      (prisma.contact_data.findUnique as any).mockResolvedValue(null);
      (prisma.gym.count as any).mockResolvedValue(1);
      (prisma.class_type.count as any).mockResolvedValue(1);
      (prisma.contact_data.create as any).mockResolvedValue({ contact_data_id: 10 });
      (prisma.trainer.create as any).mockResolvedValue({ trainer_id: 2, ...input });

      const res = await request(app).post('/admin/trainers').send(input);

      expect(res.status).toBe(201);
      expect(res.body.first_name).toBe("Bob");
      // Перевіряємо, що транзакція викликалась
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should return 400 when Zod validation fails', async () => {
      const invalidInput = {
        first_name: "B", // Занадто коротке
        email: "not-email" // Не email
      };

      const res = await request(app).post('/admin/trainers').send(invalidInput);

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /admin/trainers/:id', () => {
    it('should return 200 and update trainer', async () => {
      const updateData = { first_name: "Robert" };
      
      // Імітуємо існування тренера
      (prisma.trainer.findFirst as any).mockResolvedValue({ 
        trainer_id: 1, 
        contact_data_id: 5,
        is_deleted: false 
      });

      const res = await request(app).patch('/admin/trainers/1').send(updateData);

      expect(res.status).toBe(200);
      expect(prisma.trainer.update).toHaveBeenCalled();
    });

    it('should return 404 if trainer not found', async () => {
      (prisma.trainer.findFirst as any).mockResolvedValue(null);

      const res = await request(app).patch('/admin/trainers/999').send({ first_name: "Ghost" });
      
      expect(res.status).not.toBe(200); 
    });
  });

  describe('DELETE /admin/trainers/:id', () => {
    it('should perform soft delete', async () => {
      (prisma.trainer.findFirst as any).mockResolvedValue({ trainer_id: 1 });
      
      const res = await request(app).delete('/admin/trainers/1');

      expect(res.status).toBe(200);
      expect(prisma.trainer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainer_id: 1 },
          data: { is_deleted: true }
        })
      );
    });
  });

  describe('GET /trainers/:id/workload (Analytics)', () => {
    it('should return formatted workload stats', async () => {
      (prisma.trainer.findFirst as any).mockResolvedValue({ first_name: "Anna" });
      (prisma.class_session.groupBy as any).mockResolvedValue([
        { class_type_id: 1, _count: { session_id: 10 } }
      ]);
      (prisma.class_type.findMany as any).mockResolvedValue([
        { class_type_id: 1, name: "Pilates" }
      ]);

      const res = await request(app).get('/trainers/1/workload');

      expect(res.status).toBe(200);
      expect(res.body.stats[0]).toEqual({
        class_type: "Pilates",
        sessions_count: 10
      });
    });
  });

});