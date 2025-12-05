# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PixelBoxx** is a social platform combining MySpace's radical self-expression with Discord's community features, powered by AI design assistance. The tagline: "YOUR SPACE. YOUR RULES."

**Core differentiators:**
- Fully customizable profile pages (PixelPages) with user-written CSS in a safe sandbox
- AI-powered profile design ("make my profile look like this" with image upload)
- Discord-style communities (Boxxes) with real-time chat
- No paywall on personalization features

## Architecture

### Service Structure

The project uses a microservices architecture:

```
Frontend (Next.js 14 App Router)
    ↓
API Gateway (Edge Functions)
    ↓
├── Core API (NestJS) - Users, Profiles, Boxxes, Friends, Moderation
├── Real-time Service (NATS) - Chat messages, Presence, Notifications
└── AI Service (Python/FastAPI) - Profile design, CSS generation, Content moderation
    ↓
Data Layer (PostgreSQL + Redis + S3/R2)
```

**Tech Stack:**
- **Frontend:** Next.js 14 (App Router), TailwindCSS, Zustand, React Query
- **Backend:** NestJS (TypeScript), NATS for real-time, Prisma/Drizzle for ORM
- **Database:** PostgreSQL (primary), Redis (cache/sessions), S3/R2 (assets)
- **AI:** Claude API (design generation), GPT-4 Vision (content moderation)

### Workstream Organization

The project is organized into 6 parallel workstreams:

1. **WS1: Infrastructure** - Auth, database, API scaffold, file storage
2. **WS2: PixelPages** - Customizable profiles with CSS sandbox (★ core feature)
3. **WS3: Boxxes & Chat** - Discord-style communities with real-time messaging
4. **WS4: AI Layer** - Design assistant and content moderation
5. **WS5: Frontend Shell** - Design system, app shell, pixel art aesthetic
6. **WS6: Social & Notifications** - Friends, Top Friends, activity feeds

See `/workstreams/` directory for detailed task breakdowns.

## Critical Security Patterns

### CSS Sanitization (WS2)

User-submitted CSS is the core feature but also the biggest security risk. The sanitizer MUST:

- **Whitelist approach:** Only allow safe CSS properties (layout, visual, typography, transforms)
- **Block patterns:** `expression()`, `javascript:`, `behavior:`, `@import`, data URLs, script tags, event handlers
- **URL validation:** Only relative URLs or whitelisted domains for `background-image`, etc.
- **Scoping:** Prefix all user CSS with `.pixelpage-sandbox[data-username="X"]` to prevent leaking
- **No external resources:** Fonts must be served from our CDN, no external imports

Example blocked patterns: `/expression\s*\(/i`, `/javascript\s*:/i`, `/behavior\s*:/i`, `/@import/i`

See `workstreams/WS2-PIXELPAGES.md` section 2.2 for complete sanitization requirements.

### Content Moderation (WS4)

All user-generated content passes through AI moderation:
- **Images:** Vision model scans for nudity, violence, hate symbols, drugs, self-harm
- **Text:** Check against word lists + Claude for nuanced analysis
- **Auto-moderation rules:** Auto-approve (high confidence), auto-reject (obvious violations), queue for review (uncertain)
- **Real-time hooks:** Moderate profile images, gallery uploads, messages, guestbook entries, custom emotes

## Database Schema Notes

Key relationships:
- Each `User` has one `PixelPage` (customizable profile)
- `PixelPage` contains `custom_css` (sanitized), `layout_json` (structured sections), and relations to `PageSection[]`
- `TopFriend` table implements ranked Top 8 friends (MySpace drama feature)
- `Friendship` uses requester/addressee pattern with PENDING/ACCEPTED/BLOCKED status
- `Message` table indexes on `[channelId, createdAt]` for fast history queries
- `Notification` indexes on `[userId, read, createdAt]` for unread counts

See `ARCHITECTURE.md` lines 140-239 for complete schema.

## Real-time Architecture (NATS)

Subject/topic structure:
```
pixelboxx.boxxes.{boxxId}.channels.{channelId}.messages
pixelboxx.boxxes.{boxxId}.presence
pixelboxx.boxxes.{boxxId}.typing.{channelId}
pixelboxx.users.{userId}.notifications
pixelboxx.users.{userId}.dms
```

Message flow:
1. Client sends message via WebSocket
2. Server validates, persists to PostgreSQL
3. Server publishes to NATS
4. All subscribed clients receive in real-time

Presence cache in Redis for fast online/offline lookups.

## AI Service Integration

The AI service is a separate FastAPI service (Python) that the main API calls internally.

**Profile Design Assistant** (`POST /design/from-image`):
1. User uploads inspiration image
2. Claude Vision analyzes image → extract color palette, aesthetic, layout style
3. Claude generates CSS based on analysis + user preferences
4. CSS runs through sanitizer before returning
5. Return CSS + explanation of design choices

**Key prompts:**
- Design system prompt emphasizes: creative CSS, uses CSS custom properties, pixel art aesthetic, works in sandbox, optimized for desktop + mobile
- Available selectors: `.pixelpage`, `.profile-header`, `.profile-bio`, `.top-friends`, `.music-player`, `.photo-gallery`, `.guestbook`

See `workstreams/WS4-AI-LAYER.md` for complete implementation details.

## Design System (WS5)

**PixelBoxx Aesthetic:**
- Pixel art meets modern web
- Dark mode first (light mode optional)
- Glowing accents (`--pixel-accent-primary: #00ffaa` mint/cyan glow)
- Retro-futuristic, nostalgic but not dated

**Font Stack:**
- Display: `'Press Start 2P'` (pixel art headers)
- Headings: `'Space Grotesk'` (modern headings)
- Body: `'Inter'` (clean body text)
- Mono: `'JetBrains Mono'` (code/technical)

All design tokens in CSS custom properties. See `workstreams/WS5-FRONTEND-SHELL.md`.

## Important Implementation Notes

1. **Monorepo structure:** Use Turborepo or Nx with `apps/` (web, api, ai-service) and `packages/` (shared, ui, config)

2. **Authentication:** JWT tokens in httpOnly cookies (NOT localStorage), refresh token rotation, CSRF protection

3. **Profile rendering:** User CSS only applies within `.pixelpage-sandbox` container to prevent affecting main app. Shadow DOM is an alternative for more isolation.

4. **Message persistence:** Keep recent messages in PostgreSQL with cursor-based pagination (before/after message ID). Consider archiving old messages.

5. **Rate limiting:** Critical for AI endpoints (expensive), auth endpoints (brute force), friend requests (spam), profile saves

6. **Top Friends drama:** The ranked Top 8 friends is a core social feature. Users can drag-and-drop to reorder. Send notification when added to someone's Top Friends.

7. **Block system:** Blocked users should be completely invisible to each other - can't see profiles, messages in shared boxxes, or DM each other.

## Development Workflow

**When adding new features:**
1. Check relevant workstream document in `/workstreams/` for task breakdown and acceptance criteria
2. Follow database schema patterns (UUID primary keys, snake_case columns with @map, timestamps, soft deletes where appropriate)
3. Use TypeScript strictly (no `any` types)
4. CSS scoping: All user CSS must be scoped to prevent leaking
5. Security: Validate all user input, sanitize all output, check permissions

**When implementing CSS features:**
- ALWAYS run through the CSS sanitizer
- ALWAYS scope to the profile sandbox
- Test with known XSS vectors
- Never trust user CSS directly

**When working with AI features:**
- Implement rate limiting
- Cache common patterns
- Track costs per request
- Validate AI output (especially CSS) before returning

## Reference Documents

- **Architecture:** `ARCHITECTURE.md` - Complete project plan, database schemas, tech decisions
- **Workstreams:** `/workstreams/WS[1-6]-*.md` - Detailed task breakdowns for each area
- **Database:** Lines 140-239 in `ARCHITECTURE.md` for complete Prisma schema
- **Security:** `workstreams/WS2-PIXELPAGES.md` section 2.2 (CSS sanitization), `workstreams/WS4-AI-LAYER.md` section 4.4 (content moderation)

## Project Status

**Current:** Planning/blueprints phase. No code exists yet. All workstreams are ready to start.

**Next steps:**
1. Set up monorepo structure
2. Initialize Next.js, NestJS, and FastAPI projects
3. Database setup with Prisma/Drizzle
4. Authentication system (WS1)
5. Design system and app shell (WS5)
6. Then proceed with feature workstreams
