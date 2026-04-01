import { PrismaClient, Role, RecordType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import "dotenv/config";

// Setup adapter for Seed script
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Roles/Users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.com' },
    update: {},
    create: {
      email: 'admin@finance.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finance.com' },
    update: {},
    create: {
      email: 'analyst@finance.com',
      password: hashedPassword,
      role: Role.ANALYST,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@finance.com' },
    update: {},
    create: {
      email: 'viewer@finance.com',
      password: hashedPassword,
      role: Role.VIEWER,
    },
  });

  console.log('Users created: Admin, Analyst, Viewer');

  // 2. Create sample Financial Records (60+)
  const categories = ['Salary', 'Freelance', 'Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport', 'Healthcare'];
  const records = [];

  for (let i = 0; i < 60; i++) {
    const isIncome = Math.random() > 0.6;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Last 6 months

    records.push({
      amount: parseFloat((Math.random() * (isIncome ? 5000 : 500)).toFixed(2)),
      type: isIncome ? RecordType.INCOME : RecordType.EXPENSE,
      category,
      date,
      note: `Sample entry ${i + 1}`,
      createdById: analyst.id,
    });
  }

  await prisma.financialRecord.createMany({
    data: records as any,
  });

  console.log('60 financial records seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
