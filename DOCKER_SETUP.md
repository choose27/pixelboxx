# PixelBoxx - Docker Setup Guide

Complete guide to running the entire PixelBoxx platform with Docker Compose.

## Quick Start (TL;DR)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and set your secrets (at minimum, change JWT secrets)
nano .env

# 3. Start everything
docker-compose up --build

# 4. Access the platform
# - Frontend: http://localhost:3000
# - API: http://localhost:3001/api
# - AI Service: http://localhost:8000/docs
```

## Complete Setup

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

**IMPORTANT:** Edit `.env` and update these critical values:

```env
# Change these to long, random strings in production!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-also-long-and-random

# If using real AI features (optional - mock mode works without this)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ENABLE_MOCK_RESPONSES=true  # Set to false if using real Claude API
```

### 2. Build and Start Services

**Option A: Build and start all services**
```bash
docker-compose up --build
```

**Option B: Run in detached mode (background)**
```bash
docker-compose up --build -d
```

**Option C: Build without starting (useful for CI/CD)**
```bash
docker-compose build
```

### 3. Service Startup Order

Docker Compose automatically handles startup dependencies:

1. **postgres** - Database (waits for health check)
2. **redis** - Cache (waits for health check)
3. **nats** - Message bus (waits for health check)
4. **ai-service** - AI endpoints (waits for health check)
5. **api** - Backend API (waits for all dependencies + runs migrations)
6. **web** - Frontend (waits for API)

Total startup time: ~60-90 seconds

### 4. Access Points

Once all services are healthy:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **API** | http://localhost:3001/api | Backend REST API |
| **API Docs** | http://localhost:3001/api/health | Health check endpoint |
| **AI Service** | http://localhost:8000/docs | FastAPI Swagger docs |
| **NATS Monitor** | http://localhost:8222 | NATS monitoring dashboard |
| **PostgreSQL** | localhost:5432 | Database (user: pixelboxx, password: pixelboxx) |
| **Redis** | localhost:6379 | Cache server |

### 5. Useful Commands

**View logs (all services)**
```bash
docker-compose logs -f
```

**View logs (specific service)**
```bash
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f ai-service
```

**Check service status**
```bash
docker-compose ps
```

**Restart a specific service**
```bash
docker-compose restart api
```

**Stop all services**
```bash
docker-compose down
```

**Stop and remove volumes (WARNING: deletes database!)**
```bash
docker-compose down -v
```

**Rebuild a specific service**
```bash
docker-compose build api
docker-compose up -d api
```

### 6. Database Management

**Access PostgreSQL**
```bash
docker exec -it pixelboxx-postgres psql -U pixelboxx -d pixelboxx
```

**Run migrations manually** (normally done automatically)
```bash
docker-compose exec api npx prisma migrate deploy
```

**Access Prisma Studio** (visual database editor)
```bash
cd apps/api
npm run prisma:studio
```

**Reset database** (WARNING: deletes all data!)
```bash
docker-compose down -v
docker-compose up --build
```

### 7. Development Workflow

**For local development without Docker:**

See individual app README files:
- [apps/api/README.md](apps/api/README.md) - Backend setup
- [apps/web/README.md](apps/web/README.md) - Frontend setup
- [apps/ai-service/README.md](apps/ai-service/README.md) - AI service setup

**For Docker-based development:**

1. Make code changes
2. Rebuild affected service:
   ```bash
   docker-compose build api  # if you changed API code
   docker-compose up -d api  # restart the service
   ```

**Hot reloading in Docker:**

To enable hot reloading, mount source code as volumes (add to docker-compose.yml):

```yaml
api:
  volumes:
    - ./apps/api:/app
    - /app/node_modules
```

### 8. Testing the Platform

**1. Register a user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@pixelboxx.com",
    "password": "password123"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@pixelboxx.com",
    "password": "password123"
  }'
```

**3. Test AI service (mock mode):**
```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "X-API-Key: internal-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dark theme with neon purple accents",
    "preferences": {"dark_mode": true}
  }'
```

### 9. Monitoring

**Check service health:**
```bash
curl http://localhost:3001/api/health  # API health
curl http://localhost:8000/health      # AI service health
curl http://localhost:8222/healthz     # NATS health
```

**Monitor NATS:**
Visit http://localhost:8222 for the NATS monitoring dashboard.

**Check Redis:**
```bash
docker exec -it pixelboxx-redis redis-cli ping
```

### 10. Troubleshooting

**Services won't start:**
1. Check if ports are already in use:
   ```bash
   lsof -i :3000  # Check Next.js port
   lsof -i :3001  # Check NestJS port
   lsof -i :5432  # Check PostgreSQL port
   ```
2. Check logs:
   ```bash
   docker-compose logs
   ```

**Database connection errors:**
1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose ps postgres
   ```
2. Check DATABASE_URL in .env matches postgres service config

**API can't connect to other services:**
- Services communicate via internal Docker network using service names
- API connects to `postgres:5432`, not `localhost:5432`
- Frontend connects to `http://localhost:3001` (host network) from browser

**Build failures:**
1. Clear Docker cache:
   ```bash
   docker-compose build --no-cache
   ```
2. Remove old images:
   ```bash
   docker system prune -a
   ```

**Port conflicts:**
Edit `.env` to change ports:
```env
WEB_PORT=3000
API_PORT=3001
AI_SERVICE_PORT=8000
```

### 11. Production Deployment

For production:

1. **Set strong secrets:**
   ```bash
   # Generate random secrets
   openssl rand -base64 32  # for JWT_SECRET
   openssl rand -base64 32  # for JWT_REFRESH_SECRET
   openssl rand -base64 32  # for AI_SERVICE_API_KEY
   ```

2. **Update .env:**
   ```env
   NODE_ENV=production
   ENABLE_MOCK_RESPONSES=false
   ANTHROPIC_API_KEY=sk-ant-real-api-key
   ```

3. **Use external managed services** (recommended):
   - PostgreSQL (RDS, Supabase, etc.)
   - Redis (ElastiCache, Upstash, etc.)
   - NATS (NATS Cloud, self-hosted cluster)

4. **Enable HTTPS** with reverse proxy (nginx, Caddy, Traefik)

5. **Set up backups** for PostgreSQL data

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Docker Network                       │
│                         (pixelboxx)                          │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Postgres │    │  Redis   │    │   NATS   │              │
│  │   :5432  │    │  :6379   │    │  :4222   │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       ▲               ▲               ▲                      │
│       │               │               │                      │
│       └───────────────┼───────────────┘                      │
│                       │                                       │
│  ┌────────────────────┴─────────────┐                       │
│  │       AI Service (FastAPI)       │                       │
│  │            :8000                  │                       │
│  └───────────────┬──────────────────┘                       │
│                  │                                            │
│  ┌───────────────▼──────────────────┐                       │
│  │       API (NestJS)                │                       │
│  │         :3001                     │                       │
│  │  - Auth, Users, PixelPages        │                       │
│  │  - Boxxes, Chat, Social           │                       │
│  │  - WebSocket Gateway              │                       │
│  └───────────────┬──────────────────┘                       │
│                  │                                            │
│  ┌───────────────▼──────────────────┐                       │
│  │       Web (Next.js)               │                       │
│  │         :3000                     │                       │
│  │  - Landing, Profile, Chat UI      │                       │
│  │  - Real-time WebSocket Client     │                       │
│  └──────────────────────────────────┘                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## What Gets Built

When you run `docker-compose up --build`:

1. **ai-service** - Python FastAPI container
   - Claude API integration
   - CSS generation endpoints
   - Mock mode for development

2. **api** - Node.js NestJS container
   - Runs Prisma migrations automatically
   - Connects to all infrastructure services
   - Exposes REST + WebSocket endpoints

3. **web** - Node.js Next.js container
   - Server-side rendering
   - Static asset optimization
   - API proxy configuration

Total build time: ~5-10 minutes (first time)
Subsequent builds: ~1-2 minutes (with Docker cache)

---

**Ready to launch PixelBoxx? Run `docker-compose up --build` and watch the magic happen! 🚀**
