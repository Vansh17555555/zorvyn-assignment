import { RecordType } from '@prisma/client';
import prisma from '../config/prisma';
import logger from '../utils/logger';
import { cacheService } from '../utils/cache';

export class DashboardService {
  /**
   * Get overall stats and aggregation data.
   */
  static async getStats(months: number = 12) {
    const cacheKey = `dashboard:stats:${months}`;
    const cachedStats = cacheService.get(cacheKey);
    if (cachedStats) {
      logger.debug('Returning cached dashboard stats', { cacheKey });
      return cachedStats;
    }

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);

    const [totals, categoryWise, recent, trends] = await Promise.all([
      // 1. Total income, total expenses
      prisma.financialRecord.groupBy({
        by: ['type'],
        _sum: {
          amount: true,
        },
        where: { deletedAt: null },
      }),

      // 2. Category-wise aggregation
      prisma.financialRecord.groupBy({
        by: ['category', 'type'],
        _sum: {
          amount: true,
        },
        where: { deletedAt: null },
      }),

      // 3. Recent transactions
      prisma.financialRecord.findMany({
        where: { deletedAt: null },
        take: 5,
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { email: true } } },
      }),

      // 4. Monthly trends (simplified aggregation)
      prisma.financialRecord.findMany({
        where: {
          deletedAt: null,
          date: { gte: startDate },
        },
        select: {
          date: true,
          amount: true,
          type: true,
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Process trends into monthly buckets
    const processedTrends = this.processMonthlyTrends(trends, months);

    const income = Number(totals.find((t: any) => t.type === RecordType.INCOME)?._sum.amount || 0);
    const expense = Number(totals.find((t: any) => t.type === RecordType.EXPENSE)?._sum.amount || 0);
    const balance = income - expense;

    const stats = {
      summary: {
        totalIncome: income,
        totalExpenses: expense,
        netBalance: balance,
      },
      categoryWise: categoryWise.map((c: any) => ({
        category: c.category,
        type: c.type,
        total: Number(c._sum.amount),
      })),
      recentTransactions: recent,
      monthlyTrends: processedTrends,
    };

    cacheService.set(cacheKey, stats);
    logger.info('Dashboard stats calculated and cached', { months });
    return stats;
  }

  private static processMonthlyTrends(records: any[], months: number) {
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    
    // Initialize map with last N months
    const today = new Date();
    for (let i = 0; i < months; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(key, { income: 0, expense: 0 });
    }

    records.forEach((r) => {
        const d = r.date;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyMap.has(key)) {
            const current = monthlyMap.get(key)!;
            if (r.type === RecordType.INCOME) current.income += Number(r.amount);
            else current.expense += Number(r.amount);
            monthlyMap.set(key, current);
        }
    });

    return Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));
  }
}
