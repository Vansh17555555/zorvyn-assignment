import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../app';
import prisma from '../config/prisma';

jest.setTimeout(60000); // Increased to 60s for remote DB stability

describe('Record Endpoints (RBAC & CRUD)', () => {
  let adminToken: string;
  let viewerToken: string;
  let testRecordId: string;

  // Use seeded users for stability
  const ADMIN_EMAIL = 'admin@finance.com';
  const VIEWER_EMAIL = 'viewer@finance.com';
  const PASSWORD = 'password123';

  // Helper with retry logic for remote database connection stability
  const loginWithRetry = async (email: string, password: string, retries = 3): Promise<string> => {
    for (let i = 0; i < retries; i++) {
      try {
        const res: any = await (request(app).post('/api/auth/login') as any).send({ email, password });
        if (res.status === 200 && res.body?.data?.token) {
          return res.body.data.token;
        }
        console.warn(`Login attempt ${i + 1} failed for ${email}: ${res.status} - ${JSON.stringify(res.body)}`);
      } catch (err) {
        console.warn(`Login attempt ${i + 1} errored for ${email}:`, err);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
    }
    throw new Error(`Failed to login after ${retries} attempts for ${email}`);
  };

  beforeAll(async () => {
    try {
      // 1. Get tokens with retry logic
      adminToken = await loginWithRetry(ADMIN_EMAIL, PASSWORD);
      viewerToken = await loginWithRetry(VIEWER_EMAIL, PASSWORD);
    } catch (err) {
      console.error('Setup failed in record.test.ts beforeAll:', err);
      throw err;
    }
  });

  afterAll(async () => {
    try {
        // Cleanup only records created by tests
        await prisma.financialRecord.deleteMany({
          where: { note: 'Record Test' },
        });
    } catch (e) {
        // Silent catch for cleanup errors in remote DB
    }
  });

  describe('POST /api/records', () => {
    it('should create record as ADMIN', async () => {
      const res: any = await (request(app)
        .post('/api/records') as any)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 1000,
          type: 'INCOME',
          category: 'Salary',
          note: 'Record Test'
        });

      expect(res.status).toBe(201);
      testRecordId = res.body.data.record.id;
    });

    it('should fail to create record as VIEWER', async () => {
      const res: any = await (request(app)
        .post('/api/records') as any)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 500,
          type: 'EXPENSE',
          category: 'Transport',
          note: 'Record Test'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/records', () => {
    it('should list records for any authenticated user', async () => {
      const res: any = await (request(app)
        .get('/api/records') as any)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records).toBeDefined();
    });
  });

  describe('PATCH /api/records/:id', () => {
    it('should update record as ADMIN', async () => {
      if (!testRecordId) {
        throw new Error('Record ID not created in previous test');
      }
      const res: any = await (request(app)
        .patch(`/api/records/${testRecordId}`) as any)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 1200 });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('should fail to delete as NON-ADMIN', async () => {
      if (!testRecordId) return;
      const res: any = await (request(app)
        .delete(`/api/records/${testRecordId}`) as any)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it('should delete record as ADMIN', async () => {
      if (!testRecordId) return;
      const res: any = await (request(app)
        .delete(`/api/records/${testRecordId}`) as any)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
