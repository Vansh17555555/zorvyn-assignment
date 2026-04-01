import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import app from '../app';
import prisma, { pool } from '../config/prisma';

jest.setTimeout(30000);

describe('Auth Endpoints', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'password123';

  afterAll(async () => {
    // Cleanup test data in correct order
    await prisma.financialRecord.deleteMany({
      where: { createdBy: { email: { contains: 'test_' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test_' } },
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const res: any = await (request(app)
        .post('/api/auth/signup') as any)
        .send({
          email: testEmail,
          password: password,
          role: 'VIEWER'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it('should fail with duplicate email', async () => {
      const res: any = await (request(app)
        .post('/api/auth/signup') as any)
        .send({
          email: testEmail,
          password: password,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should fail with invalid email format', async () => {
      const res: any = await (request(app)
        .post('/api/auth/signup') as any)
        .send({
          email: 'not-an-email',
          password: password,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const res: any = await (request(app)
        .post('/api/auth/login') as any)
        .send({
          email: testEmail,
          password: password,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res: any = await (request(app)
        .post('/api/auth/login') as any)
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
