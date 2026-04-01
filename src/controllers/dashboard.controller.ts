import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { HttpCode } from '../utils/errors';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? Number(req.query.months) : 12;
      const stats = await DashboardService.getStats(months);
      
      res.status(HttpCode.OK).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
