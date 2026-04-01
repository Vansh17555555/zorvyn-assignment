import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../app';

describe('Health Check API', () => {
  it('should return 200 OK for /health', async () => {
    const res: any = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 401 Unauthorized for unprotected routes', async () => {
    const res: any = await request(app).get('/api/records');
    expect(res.status).toBe(401);
  });
});
