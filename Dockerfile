# PixelBoxx API - Dockerfile for Monorepo
# Build context: repository root

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy api app
COPY apps/api ./apps/api/

# Create packages directory structure (for workspace resolution)
RUN mkdir -p packages/config packages/shared packages/ui

# Install dependencies
RUN npm ci

# Generate Prisma Client
WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Create packages directory structure
RUN mkdir -p packages/config packages/shared packages/ui

# Copy api package.json
COPY apps/api/package*.json ./apps/api/

# Install production dependencies
RUN npm ci --only=production

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Set working directory to api
WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
