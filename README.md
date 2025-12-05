# PixelBoxx

**YOUR SPACE. YOUR RULES.**

A 2025 MySpace revival - combining radical self-expression with modern chat, powered by AI design assistance.

## Project Structure (Turborepo Monorepo)

```
pixelboxx/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   ├── api/          # NestJS backend API
│   └── ai-service/   # Python/FastAPI AI service
├── packages/
│   ├── shared/       # Shared TypeScript types & utilities
│   ├── ui/           # Shared React UI components
│   └── config/       # Shared ESLint, TypeScript configs
├── docker/           # Docker configurations
├── docs/             # Additional documentation
├── scripts/          # Development scripts
├── workstreams/      # Workstream task breakdowns
├── ARCHITECTURE.md   # Complete architecture & plan
├── CLAUDE.md         # Guide for Claude Code agents
└── landing.html      # Production landing page sample
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 7+
- Python 3.11+ (for AI service)

### Installation

```bash
# Install dependencies for all workspaces
npm install

# Start all services in development
npm run dev

# Build all packages
npm run build

# Run linting
npm run lint
```

### Individual Services

```bash
# Frontend only (Next.js)
cd apps/web
npm run dev

# Backend API only (NestJS)
cd apps/api
npm run start:dev

# AI Service only (FastAPI)
cd apps/ai-service
python -m uvicorn main:app --reload
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete project architecture, database schemas, and technical decisions.

## Workstreams

Development is organized into 6 parallel workstreams:

1. **WS1: Infrastructure** - Auth, database, API scaffold
2. **WS2: PixelPages** - Customizable profiles with CSS sandbox ⭐
3. **WS3: Boxxes & Chat** - Real-time communities
4. **WS4: AI Layer** - Design assistant & moderation
5. **WS5: Frontend Shell** - Design system & app shell
6. **WS6: Social & Notifications** - Friends, Top Friends, activity

See `/workstreams/` for detailed task breakdowns.

## Tech Stack

- **Frontend:** Next.js 14, TailwindCSS, Zustand, React Query
- **Backend:** NestJS, NATS, Prisma/Drizzle
- **Database:** PostgreSQL, Redis, S3/R2
- **AI:** Claude API, GPT-4 Vision
- **Infrastructure:** Docker, Turborepo

## Documentation

- **ARCHITECTURE.md** - Complete project plan & architecture
- **CLAUDE.md** - Guide for Claude Code agents
- **Workstreams/** - Detailed task breakdowns per workstream

## Development

This project uses **Turborepo** for monorepo management. All apps and packages are in their respective directories with independent package.json files.

Turbo handles:
- Parallel builds across packages
- Smart caching
- Task pipelines with dependencies
- Development server orchestration

## License

TBD

---

*Built with ❤️ by a 12-year-old's vision, her dad's infrastructure chops, and Claude's design skills.*
