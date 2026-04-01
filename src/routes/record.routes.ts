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
 */
router.get('/', authenticate, RecordController.list);

/**
 * @openapi
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', authenticate, authorize([Role.ANALYST, Role.ADMIN]), RecordController.create);

/**
 * @openapi
 * /api/records/{id}:
 *   patch:
 *     summary: Update an existing record
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id', authenticate, authorize([Role.ANALYST, Role.ADMIN]), RecordController.update);

/**
 * @openapi
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a record
 *     tags: [Records]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', authenticate, authorize([Role.ADMIN]), RecordController.delete);

export default router;
