# PixelBoxx API - Dockerfile
FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
# Install dependencies
RUN npm ci
# Copy source code
COPY . .
# Generate Prisma Client (dummy URL for build time)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate
# Build the application
RUN npm run build
# Production stage
FROM node:20-alpine
WORKDIR /app
# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
# Install production dependencies only
RUN npm ci --only=production
# Copy Prisma generated client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy built application
COPY --from=builder /app/dist ./dist
# Expose port
EXPOSE 3001
# Set environment variables
ENV NODE_ENV=production
# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
