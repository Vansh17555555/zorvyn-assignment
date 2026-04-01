import { Router } from 'express';
import { RecordController } from '../controllers/record.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @openapi
 * /api/records:
 *   get:
 *     summary: List all financial records (filtered and paginated)
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [INCOME, EXPENSE] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of records retrieved successfully
 */
router.get('/', authenticate, RecordController.list);

/**
 * @openapi
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount: { type: number, example: 500.50 }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string, example: "Freelance" }
 *               note: { type: string, example: "Upwork project" }
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post('/', authenticate, authorize([Role.ANALYST, Role.ADMIN]), RecordController.create);

/**
 * @openapi
 * /api/records/{id}:
 *   patch:
 *     summary: Update an existing record
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.patch('/:id', authenticate, authorize([Role.ANALYST, Role.ADMIN]), RecordController.update);

/**
 * @openapi
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a record
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Record deleted successfully
 */
router.delete('/:id', authenticate, authorize([Role.ADMIN]), RecordController.delete);

export default router;
