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
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of months to calculate trends for
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, dashboardRateLimiter, DashboardController.getDashboard);

export default router;
