# Stage 1: Build Image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies for building
# Note: npm is already available in node images.
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
# Note: DATABASE_URL is required by Prisma even at build time for schema validation
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

# Build TypeScript to Javascript
RUN npm run build

# Remove development dependencies for smaller runtime image
RUN npm prune --production

# Stage 2: Runtime Image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy build artifacts and runtime files
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Create logs directory for winston
RUN mkdir -p logs

# Expose the application port (Cloud Run defaults to 8080)
EXPOSE 8080

# Start command
CMD ["node", "dist/server.js"]
