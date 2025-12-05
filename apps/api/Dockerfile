# PixelBoxx API - Dockerfile for Monorepo
FROM node:20-alpine AS builder

# Set working directory to monorepo root
WORKDIR /app

# Copy root package files first
COPY package*.json ./
COPY turbo.json ./

# Copy the entire api app directory
COPY apps/api ./apps/api/

# Create packages directory structure (workspaces expects these)
RUN mkdir -p packages/config packages/shared packages/ui

# Install dependencies (this installs all workspace dependencies)
RUN npm ci

# Generate Prisma Client (dummy URL for build time)
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

# Copy only package.json from api (for workspace resolution)
COPY apps/api/package*.json ./apps/api/

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Change to api directory
WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
