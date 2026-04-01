import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import app from '../app';
import prisma from '../config/prisma';

jest.setTimeout(60000);

describe('Dashboard Endpoints', () => {
    let token: string;

    // Use seeded admin for stability
    const ADMIN_EMAIL = 'admin@finance.com';
    const PASSWORD = 'password123';

    beforeAll(async () => {
        try {
            // 1. Get ADMIN token
            const login: any = await (request(app)
                .post('/api/auth/login') as any)
                .send({
                    email: ADMIN_EMAIL,
                    password: PASSWORD,
                });
            
            if (login.status !== 200) {
                throw new Error(`Admin login failed: ${JSON.stringify(login.body)}`);
            }
            token = login.body.data.token;

            // 2. Create some sample records for dashboard
            await (request(app)
                .post('/api/records') as any)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 1000, type: 'INCOME', category: 'Salary', note: 'Dash Test' });
            
            await (request(app)
                .post('/api/records') as any)
                .set('Authorization', `Bearer ${token}`)
                .send({ amount: 500, type: 'EXPENSE', category: 'Rent', note: 'Dash Test' });
        } catch (err) {
            console.error('Setup failed in dashboard.test.ts beforeAll:', err);
            throw err;
        }
    });

    afterAll(async () => {
        // Cleanup test data in correct order
        await prisma.financialRecord.deleteMany({
            where: { note: 'Dash Test' },
        });
    });

    describe('GET /api/dashboard', () => {
        it('should return aggregation stats with totals and net balance', async () => {
            const res: any = await (request(app)
                .get('/api/dashboard') as any)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.summary.totalIncome).toBeGreaterThanOrEqual(1000);
            expect(res.body.data.summary.totalExpenses).toBeGreaterThanOrEqual(500);
            expect(res.body.data.summary.netBalance).toBeDefined();
        });

        it('should return category-wise aggregation', async () => {
            const res: any = await (request(app)
                .get('/api/dashboard') as any)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.categoryWise).toBeDefined();
            expect(res.body.data.categoryWise.length).toBeGreaterThan(0);
        });

        it('should return recent transactions and monthly trends', async () => {
            const res: any = await (request(app)
                .get('/api/dashboard') as any)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.recentTransactions).toBeDefined();
            expect(res.body.data.monthlyTrends).toBeDefined();
        });

        it('should support dynamic months parameter for trends', async () => {
            const res: any = await (request(app)
                .get('/api/dashboard?months=6') as any)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.monthlyTrends.length).toBeLessThanOrEqual(6);
        });
    });
});
