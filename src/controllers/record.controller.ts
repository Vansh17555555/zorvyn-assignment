import { Request, Response, NextFunction } from 'express';
import { RecordService } from '../services/record.service';
import { HttpCode, AppError } from '../utils/errors';
import { RecordType, Role } from '@prisma/client';

export class RecordController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, startDate, endDate, type, category } = req.query;
      const result = await RecordService.list({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as RecordType,
        category: category as string,
      });

      res.status(HttpCode.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Authentication required', HttpCode.UNAUTHORIZED);
      const record = await RecordService.create(req.user.userId, req.body);
      res.status(HttpCode.CREATED).json({
        status: 'success',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Authentication required', HttpCode.UNAUTHORIZED);
      const { id } = req.params;
      const result = await RecordService.update(id as string, req.user.userId, req.user.role, req.body);
      res.status(HttpCode.OK).json({
        status: 'success',
        data: { record: result },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Authentication required', HttpCode.UNAUTHORIZED);
      const { id } = req.params;
      await RecordService.delete(id as string, req.user.userId, req.user.role);
      res.status(HttpCode.OK).json({
        status: 'success',
        message: 'Record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
