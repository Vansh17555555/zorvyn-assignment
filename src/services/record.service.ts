import { RecordType, Role } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError, HttpCode } from '../utils/errors';
import logger from '../utils/logger';
import { cacheService } from '../utils/cache';
import { z } from 'zod';

export const RecordSchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(RecordType),
  category: z.string().min(1),
  date: z.string().datetime().nullable().optional(),
  note: z.string().optional(),
});

export class RecordService {
  /**
   * List all records with pagination and filters.
   */
  static async list(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    type?: RecordType;
    category?: string;
  }) {
    const { page = 1, limit = 10, startDate, endDate, type, category } = params;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }
    if (type) where.type = type;
    if (category) where.category = category;

    const [total, records] = await Promise.all([
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { email: true, role: true } } },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      records,
    };
  }

  /**
   * Create a new record.
   */
  static async create(userId: string, data: z.infer<typeof RecordSchema>) {
    const validatedData = RecordSchema.parse(data);

    const record = await prisma.financialRecord.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        createdById: userId,
      },
    });

    // Invalidate cache since data changed
    cacheService.invalidate('dashboard');
    logger.info(`Record created by ${userId}`, { recordId: record.id });
    return record;
  }

  /**
   * Update an existing record.
   */
  static async update(recordId: string, userId: string, userRole: Role, data: any) {
    const record = await prisma.financialRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new AppError('Record not found', HttpCode.NOT_FOUND);

    // Only creator or ADMIN can update
    // ANALYST can update as per RBAC matrix, but let's check ownership for safety if needed.
    // User requested ANALYST can create/update.
    if (userRole !== Role.ADMIN && record.createdById !== userId && userRole !== Role.ANALYST) {
      throw new AppError('Insufficient permissions', HttpCode.FORBIDDEN);
    }

    const updated = await prisma.financialRecord.update({
      where: { id: recordId },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });

    cacheService.invalidate('dashboard');
    logger.info(`Record updated by ${userId}`, { recordId: record.id });
    return updated;
  }

  /**
   * Soft delete a record.
   */
  static async delete(recordId: string, userId: string, userRole: Role) {
    const record = await prisma.financialRecord.findUnique({ where: { id: recordId } });
    if (!record) throw new AppError('Record not found', HttpCode.NOT_FOUND);

    // ONLY ADMIN can delete as per RBAC matrix
    if (userRole !== Role.ADMIN) {
      throw new AppError('Only Admins can delete records', HttpCode.FORBIDDEN);
    }

    await prisma.financialRecord.update({
      where: { id: recordId },
      data: { deletedAt: new Date() },
    });

    cacheService.invalidate('dashboard');
    logger.info(`Record soft-deleted by ${userId}`, { recordId: record.id });
  }
}
