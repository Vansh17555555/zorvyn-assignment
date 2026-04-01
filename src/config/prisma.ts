import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import "dotenv/config";

/**
 * Initialize Prisma Client with Driver Adapter for Prisma 7.
 */
export const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduced max connections for Neon stability
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10s for remote DB cold starts
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
}).$extends({
  query: {
    financialRecord: {
      async findMany({ args, query }: any) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }: any) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }: any) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async count({ args, query }: any) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

export default prisma;
export { prisma };
