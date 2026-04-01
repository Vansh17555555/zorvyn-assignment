# Finance Dashboard Backend

A production-quality backend system for a Finance Dashboard built with **Node.js**, **Express**, **TypeScript**, and **Prisma 7**.

## 🚀 Features

- **Layered Architecture**: Clean separation between Routes, Controllers, Services, and Database layers.
- **Role-Based Access Control (RBAC)**: VIEWER, ANALYST, and ADMIN roles with middleware-based enforcement.
- **Smart Caching**: In-memory caching for dashboard statistics with automatic invalidation on record mutations.
- **Optimized Aggregations**: Prisma-based grouping and indexing for high-performance financial reporting.
- **Soft Delete**: Global soft delete implementation via Prisma Client Extensions.
- **Security**: Rate limiting, Helmet security headers, and JWT-based authentication.
- **Validation**: Strict request validation using Zod schemas.
- **Documentation**: Professional API documentation using Swagger UI.

## 🛠 Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **ORM**: Prisma 7 (with PG Driver Adapter)
- **Security**: JWT, Bcrypt, Helmet, Express Rate Limit
- **Validation**: Zod
- **Testing**: Jest & Supertest
- **Logging**: Winston

---

## 🔐 Access Control Matrix

| Action | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| View transactions | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| Create transaction | ❌ | ✅ | ✅ |
| Update transaction | ❌ | ✅ | ✅ |
| Delete transaction | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

> **Note on ANALYST Role**: In this finance context, ANALYSTs are granted **Create** and **Update** permissions. This reflects real-world workflows where financial analysts are responsible for logging entries and revising transactions for accuracy, while **Delete** and **User Management** remains restricted to ADMINs for audit integrity.

---

## 🏗 Architecture Decisions

### 1. Prisma 7 Driver Adapter
We use the Prisma 7 `@prisma/adapter-pg` to handle database connections explicitly via a connection pool, ensuring compatibility with modern serverless environments (like Neon).

### 2. Cache Invalidation Strategy
Dashboard statistics are cached for 5 minutes by default. However, any write operation (`POST /records`, `PATCH /records`, `DELETE /records`) invokes a cache invalidation trigger to ensure the dashboard reflects the latest financial data immediately.

### 3. Soft Delete via Extensions
Instead of manually adding `where: { deletedAt: null }` to every query, we use Prisma Client Extensions to automatically intercept queries and filter out deleted records.

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL instance (Neon URL provided)

### 2. Setup
```bash
# Install dependencies
npm install

# Create .env from example (The provided Neon URL is already pre-configured in .env)
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Seed the database (Important for testing roles)
npm run seed
```

### 3. Running & Testing
```bash
# Running tests
npm test

# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 4. API Documentation
Once running, visit `http://localhost:5000/api-docs` (assuming `PORT=5000`) to view the full interactive Swagger documentation.

### 5. Postman Collection
A pre-configured Postman collection is available at `finance-dashboard.postman_collection.json`. Import it directly into Postman to test all authenticated workflows.

---

## 🧪 Seeding Data
The seed script (`npm run seed`) creates the following test users (all passwords: `password123`):
- **Admin**: `admin@finance.com`
- **Analyst**: `analyst@finance.com`
- **Viewer**: `viewer@finance.com`
- Plus **60+** sample financial records spanning the last 6 months.
