# PixelBoxx API (Backend)

NestJS backend API for PixelBoxx - Core authentication and user management.

## Stack

- **Framework:** NestJS (TypeScript, strict mode)
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis (sessions, rate limiting, presence) - TODO
- **Real-time:** NATS Server - TODO
- **Storage:** S3/Cloudflare R2 - TODO
- **Auth:** JWT with bcrypt password hashing

## Completed Features

### WS1: Infrastructure (Phase 1)
- [x] Authentication module (JWT)
- [x] User registration & login
- [x] Database setup (Prisma schema)
- [x] Password hashing (bcrypt with 10 rounds)
- [x] Protected routes with JWT guards
- [x] Input validation (class-validator)
- [x] CORS configuration
- [x] Global validation pipe

### Still TODO from WS1:
- [ ] Redis integration
- [ ] S3/R2 file uploads
- [ ] Rate limiting middleware

### WS2: PixelPages
- [ ] PixelPages CRUD
- [ ] CSS sanitization
- [ ] Theme management
- [ ] Guestbook API

### WS3: Boxxes & Chat
- [ ] Boxxes CRUD
- [ ] Channel management
- [ ] NATS integration (WebSocket gateway)
- [ ] Message persistence
- [ ] DM system
- [ ] Presence tracking

### WS6: Social
- [ ] Friends system
- [ ] Top Friends management
- [ ] Follower system
- [ ] Block system
- [ ] Notification service

## Current Directory Structure

```
apps/api/
├── src/
│   ├── auth/                          # Authentication module
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts         # POST /auth/register, /auth/login, GET /auth/me
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── users/                         # User management
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts        # GET /users/me, PATCH /users/me
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── prisma/                        # Database module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts                  # Root module
│   └── main.ts                        # Application entry point
├── prisma/
│   └── schema.prisma                  # User and Session models
├── .env                               # Environment variables (gitignored)
├── .env.example                       # Environment template
├── .gitignore
├── nest-cli.json
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── API_TESTING.md                     # Complete testing guide
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Create Database
```bash
# Using psql
psql -U postgres -c "CREATE DATABASE pixelboxx;"
```

### 4. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3001/api`

## Available Scripts

```bash
npm run start:dev          # Start in watch mode
npm run build              # Build for production
npm run start:prod         # Start production build
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio (visual DB editor)
```

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- **POST** `/api/auth/register` - Create new user account
- **POST** `/api/auth/login` - Login and get JWT token
- **GET** `/api/auth/me` - Get current user (protected)

### Users
- **GET** `/api/users/me` - Get current user profile (protected)
- **PATCH** `/api/users/me` - Update current user profile (protected)

See [API_TESTING.md](/Users/matt/Projects/pixelboxx/apps/api/API_TESTING.md) for detailed examples and cURL commands.

## Database Schema

### User Model
- `id` (UUID) - Primary key
- `username` (String, unique, 3-32 chars)
- `email` (String, unique)
- `passwordHash` (String) - bcrypt hashed
- `displayName` (String, optional, max 64 chars)
- `avatarUrl` (String, optional)
- `role` (Enum: USER, MOD, ADMIN)
- `isVerified` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

### Session Model
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to User
- `token` (String, unique)
- `refreshToken` (String, unique)
- `expiresAt` (DateTime)
- `createdAt` (Timestamp)

## Environment Variables

Required variables (see `.env.example`):

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pixelboxx?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Testing Authentication Flow

### 1. Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

For complete testing guide, see [API_TESTING.md](/Users/matt/Projects/pixelboxx/apps/api/API_TESTING.md)
