import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { dashboardRateLimiter } from '../middlewares/security.middleware';

const router = Router();

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics (income, expenses, trends, recent)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authenticate, dashboardRateLimiter, DashboardController.getDashboard);

export default router;
