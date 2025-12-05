# Workstream 1: Core Infrastructure

## Overview
The foundation everything else builds on. Auth, database, API skeleton, file storage, caching.

**Priority:** 🔴 CRITICAL - Must complete before other workstreams can fully integrate.

---

## Task Breakdown

### 1.1 Project Scaffolding
**Estimated effort:** 2-4 hours

- [ ] **1.1.1** Create monorepo structure (Turborepo or Nx)
  ```
  pixelboxx/
  ├── apps/
  │   ├── web/          # Next.js frontend
  │   ├── api/          # NestJS backend
  │   └── ai-service/   # Python/FastAPI AI service
  ├── packages/
  │   ├── shared/       # Shared TypeScript types
  │   ├── ui/           # Shared UI components
  │   └── config/       # Shared configs (ESLint, TS, etc.)
  ├── docker/           # Docker configs
  ├── docs/             # Documentation
  └── scripts/          # Dev scripts
  ```
- [ ] **1.1.2** Initialize Next.js 14 app with App Router
- [ ] **1.1.3** Initialize NestJS API with modular structure
- [ ] **1.1.4** Set up shared TypeScript types package
- [ ] **1.1.5** Configure TypeScript paths and aliases
- [ ] **1.1.6** Set up ESLint + Prettier with shared config
- [ ] **1.1.7** Create development docker-compose (Postgres, Redis, NATS)

**Deliverable:** Running dev environment with all services booting.

---

### 1.2 Database Setup
**Estimated effort:** 4-6 hours

- [ ] **1.2.1** Choose and configure ORM (Prisma recommended for type safety)
- [ ] **1.2.2** Create initial schema with core tables:
  - users
  - sessions
  - email_verifications
- [ ] **1.2.3** Set up migration workflow
- [ ] **1.2.4** Create seed script for development data
- [ ] **1.2.5** Set up database connection pooling (for production)
- [ ] **1.2.6** Create database utility functions (transactions, soft deletes)

**Schema (initial):**
```prisma
model User {
  id            String   @id @default(uuid())
  username      String   @unique @db.VarChar(32)
  email         String   @unique @db.VarChar(255)
  passwordHash  String   @map("password_hash")
  displayName   String?  @map("display_name") @db.VarChar(64)
  avatarUrl     String?  @map("avatar_url") @db.VarChar(500)
  isVerified    Boolean  @default(false) @map("is_verified")
  role          Role     @default(USER)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  sessions      Session[]
  pixelPage     PixelPage?
  
  @@map("users")
}

enum Role {
  USER
  MOD
  ADMIN
}

model Session {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  token        String   @unique
  refreshToken String   @unique @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}
```

**Deliverable:** Migrations running, can create/query users.

---

### 1.3 Authentication System
**Estimated effort:** 8-12 hours

- [ ] **1.3.1** Create auth module in NestJS
- [ ] **1.3.2** Implement password hashing (Argon2 or bcrypt)
- [ ] **1.3.3** JWT token generation and validation
- [ ] **1.3.4** Refresh token rotation strategy
- [ ] **1.3.5** Auth guards for protected routes
- [ ] **1.3.6** Create auth endpoints:
  - `POST /auth/register` - Create account
  - `POST /auth/login` - Get tokens
  - `POST /auth/refresh` - Rotate refresh token
  - `POST /auth/logout` - Invalidate session
  - `GET /auth/me` - Get current user
- [ ] **1.3.7** Email verification flow (optional for MVP, but plan for it)
- [ ] **1.3.8** Password reset flow (optional for MVP)
- [ ] **1.3.9** Rate limiting on auth endpoints (prevent brute force)

**Security considerations:**
- Tokens in httpOnly cookies (not localStorage)
- CSRF protection
- Secure password requirements
- Account lockout after failed attempts

**Deliverable:** Users can register, login, stay logged in, logout.

---

### 1.4 User Registration & Login Flows (Frontend)
**Estimated effort:** 6-8 hours

- [ ] **1.4.1** Create auth context/provider
- [ ] **1.4.2** Registration page with form validation
  - Username (unique check)
  - Email (format validation)
  - Password (strength requirements)
  - Confirm password
- [ ] **1.4.3** Login page
- [ ] **1.4.4** Token storage and refresh logic
- [ ] **1.4.5** Protected route wrapper
- [ ] **1.4.6** Redirect logic (login → home, register → onboarding)
- [ ] **1.4.7** Error handling (duplicate email, wrong password, etc.)
- [ ] **1.4.8** Loading states during auth actions

**Deliverable:** Full auth flow in the UI.

---

### 1.5 API Structure & Middleware
**Estimated effort:** 4-6 hours

- [ ] **1.5.1** Global exception filter (consistent error responses)
- [ ] **1.5.2** Request validation pipes (class-validator)
- [ ] **1.5.3** Response serialization (class-transformer)
- [ ] **1.5.4** Request logging middleware
- [ ] **1.5.5** CORS configuration
- [ ] **1.5.6** Rate limiting middleware (Redis-backed)
- [ ] **1.5.7** API versioning strategy (/v1/)
- [ ] **1.5.8** Health check endpoints
- [ ] **1.5.9** OpenAPI/Swagger documentation setup

**API Response Format:**
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username already taken",
    "details": { ... }
  }
}
```

**Deliverable:** Clean, consistent API structure with good DX.

---

### 1.6 Redis Setup
**Estimated effort:** 2-3 hours

- [ ] **1.6.1** Redis connection module
- [ ] **1.6.2** Session store implementation
- [ ] **1.6.3** Rate limiting store
- [ ] **1.6.4** Cache utilities (get, set, invalidate patterns)
- [ ] **1.6.5** Pub/sub setup (for real-time features later)

**Deliverable:** Redis integrated, sessions and rate limiting working.

---

### 1.7 File Storage (S3/R2)
**Estimated effort:** 4-6 hours

- [ ] **1.7.1** S3/R2 client setup
- [ ] **1.7.2** Upload endpoints with validation:
  - File type restrictions (images only for MVP)
  - File size limits
  - Virus scanning consideration
- [ ] **1.7.3** Signed URL generation for private assets
- [ ] **1.7.4** Image processing pipeline (resize, optimize)
- [ ] **1.7.5** CDN configuration for public assets
- [ ] **1.7.6** Cleanup job for orphaned files

**Endpoints:**
- `POST /uploads/avatar` - Upload profile picture
- `POST /uploads/image` - General image upload
- `DELETE /uploads/:id` - Remove file

**Deliverable:** Users can upload and serve images.

---

### 1.8 CI/CD Pipeline
**Estimated effort:** 4-6 hours

- [ ] **1.8.1** GitHub Actions workflow for testing
- [ ] **1.8.2** Linting and type checking in CI
- [ ] **1.8.3** Database migration checks
- [ ] **1.8.4** Preview deployments (Vercel for frontend)
- [ ] **1.8.5** Production deployment pipeline
- [ ] **1.8.6** Environment variable management
- [ ] **1.8.7** Monitoring setup (basic health checks)

**Deliverable:** Push to main = automatic deploy.

---

## Dependencies

This workstream has **no blockers** - it's the foundation.

Other workstreams depend on:
- **WS2 (PixelPages):** Needs auth, file uploads, database
- **WS3 (Chat):** Needs auth, database, Redis
- **WS4 (AI):** Needs auth, file uploads
- **WS5 (Frontend):** Needs auth context, API client
- **WS6 (Social):** Needs auth, database

---

## Acceptance Criteria

- [ ] New user can register with email/password
- [ ] User can log in and receive tokens
- [ ] Protected routes reject unauthenticated requests
- [ ] Refresh token rotation works correctly
- [ ] User can upload an avatar image
- [ ] API returns consistent error formats
- [ ] Rate limiting prevents abuse
- [ ] All tests pass in CI
- [ ] Development environment spins up with one command

---

## Notes for Agents

When working on this workstream:

1. **Security first** - Auth is security-critical. No shortcuts.
2. **Type everything** - Full TypeScript, no `any` types.
3. **Test auth flows** - Unit tests for token handling, integration tests for endpoints.
4. **Document as you go** - API docs, ENV requirements, setup instructions.
5. **Think about scale** - Connection pooling, stateless services, horizontal scaling.

---

## Files to Create

```
apps/api/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       └── auth-response.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── uploads/
│   ├── uploads.module.ts
│   ├── uploads.controller.ts
│   └── uploads.service.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── middleware/
│   │   ├── logging.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── utils/
└── prisma/
    ├── schema.prisma
    └── seed.ts
```
