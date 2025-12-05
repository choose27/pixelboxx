# PixelBoxx Architecture & Project Plan

## Vision
**PixelBoxx** - The 2025 MySpace Revival. A social platform where your profile IS your identity. Discord's community features + MySpace's radical self-expression, powered by AI design assistance.

**Tagline:** YOUR SPACE. YOUR RULES.

---

## Core Value Propositions

1. **Unlimited Personalization** - No paywall on self-expression (looking at you, Nitro)
2. **AI-Powered Design** - Upload inspo, get a profile. 2025 MySpace means you don't need to learn CSS
3. **Community + Identity** - Real-time chat tied to profiles that actually matter
4. **Nostalgic Yet Modern** - Pixel art aesthetic, retro soul, production-grade tech

---

## Target Users

- **Primary:** Teens & young adults (13+) who want self-expression
- **Secondary:** Millennials nostalgic for MySpace era
- **Psychographic:** Creative, wants to stand out, tired of algorithmic sameness

---

## Feature Overview

### 1. PixelPages (Profile System) ⭐ Core Feature
The customizable profile page - the heart of PixelBoxx.

- **Full CSS Sandbox** - Users can customize everything (safely sandboxed)
- **Template Library** - Beautiful starting points, categorized by aesthetic
- **AI Design Assistant** - "Make my profile look like this" with image upload
- **Profile Sections:**
  - Hero/banner area
  - About me
  - Top Friends (draggable ranking!)
  - Music player (auto-play optional - the MySpace way)
  - Guestbook/wall for comments
  - Photo gallery
  - Custom widgets/badges
- **Profile Themes** - Save and share your CSS as a theme others can use

### 2. Boxxes (Servers/Communities)
Discord-style community spaces.

- **Create/Join Boxxes** - Public or invite-only
- **Channels** - Text channels within boxxes
- **Roles & Permissions** - Basic moderation tools
- **Boxx Customization** - Custom icons, banners, colors

### 3. Chat System
Real-time messaging throughout the platform.

- **Boxx Channels** - Group chat within communities
- **Direct Messages** - 1:1 and group DMs
- **Rich Messages** - Embeds, images, custom emotes
- **Presence** - Online/offline/custom status

### 4. Social Graph
The connections layer.

- **Friends System** - Add, accept, block
- **Top Friends** - Ranked display on profile (the drama feature 😂)
- **Followers** - Optional public following
- **Friend Activity** - See what friends are up to

### 5. AI Layer
Intelligence throughout the platform.

- **Profile Design Assistant** - Generate CSS from inspiration images
- **Content Moderation** - Vision model scanning for safety
- **Smart Suggestions** - Template recommendations based on taste

### 6. Safety & Moderation
Built-in from day one.

- **CSS Sanitization** - No script injection, safe subset of properties
- **Vision Moderation** - AI scanning for inappropriate content
- **Reporting System** - User reports with mod queue
- **Age-Appropriate Defaults** - Safe defaults for younger users
- **Rate Limiting** - Abuse prevention

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js 14 App                                                             │
│  ├── App Router (RSC + Client Components)                                   │
│  ├── TailwindCSS + Custom Design System                                     │
│  ├── Real-time: NATS WebSocket Client                                       │
│  └── State: Zustand + React Query                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Edge Functions / API Routes                                                 │
│  ├── Authentication middleware                                               │
│  ├── Rate limiting                                                           │
│  └── Request validation                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│    CORE API SERVICE   │ │   REALTIME SERVICE    │ │     AI SERVICE        │
├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
│  NestJS               │ │  NATS Server          │ │  Python/FastAPI       │
│  ├── Users            │ │  ├── Chat messages    │ │  ├── Profile design   │
│  ├── Profiles         │ │  ├── Presence         │ │  ├── CSS generation   │
│  ├── Boxxes           │ │  ├── Notifications    │ │  ├── Content mod      │
│  ├── Friends          │ │  └── Live updates     │ │  └── Image analysis   │
│  └── Moderation       │ │                       │ │                       │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Primary)          Redis (Cache/Sessions)     S3/R2 (Assets)    │
│  ├── Users & auth              ├── Session store          ├── Profile imgs  │
│  ├── Profiles & CSS            ├── Presence cache         ├── User uploads  │
│  ├── Boxxes & channels         ├── Rate limiting          ├── Emotes        │
│  ├── Messages (recent)         └── Real-time state        └── Themes        │
│  ├── Friendships                                                            │
│  └── Moderation logs                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Core Tables)

```sql
-- Users & Authentication
users
  id              UUID PRIMARY KEY
  username        VARCHAR(32) UNIQUE
  email           VARCHAR(255) UNIQUE
  password_hash   VARCHAR(255)
  display_name    VARCHAR(64)
  avatar_url      VARCHAR(500)
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
  is_verified     BOOLEAN
  role            ENUM('user', 'mod', 'admin')

-- PixelPages (Profiles)
pixel_pages
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users
  custom_css      TEXT                    -- Sanitized CSS
  layout_json     JSONB                   -- Structured layout data
  bio             TEXT
  music_url       VARCHAR(500)            -- Optional music player
  theme_id        UUID REFERENCES themes  -- Optional base theme
  is_public       BOOLEAN DEFAULT true
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

-- Themes (Shareable profile templates)
themes
  id              UUID PRIMARY KEY
  creator_id      UUID REFERENCES users
  name            VARCHAR(64)
  description     TEXT
  css             TEXT
  preview_url     VARCHAR(500)
  is_public       BOOLEAN
  use_count       INTEGER DEFAULT 0
  created_at      TIMESTAMP

-- Top Friends
top_friends
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users
  friend_id       UUID REFERENCES users
  position        INTEGER (1-8)           -- Ranked position
  created_at      TIMESTAMP
  UNIQUE(user_id, position)

-- Friendships
friendships
  id              UUID PRIMARY KEY
  requester_id    UUID REFERENCES users
  addressee_id    UUID REFERENCES users
  status          ENUM('pending', 'accepted', 'blocked')
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

-- Boxxes (Servers)
boxxes
  id              UUID PRIMARY KEY
  name            VARCHAR(64)
  description     TEXT
  icon_url        VARCHAR(500)
  banner_url      VARCHAR(500)
  owner_id        UUID REFERENCES users
  is_public       BOOLEAN
  member_count    INTEGER DEFAULT 0
  created_at      TIMESTAMP

-- Channels
channels
  id              UUID PRIMARY KEY
  boxx_id        UUID REFERENCES boxxes
  name            VARCHAR(64)
  type            ENUM('text', 'voice')
  position        INTEGER
  created_at      TIMESTAMP

-- Messages
messages
  id              UUID PRIMARY KEY
  channel_id      UUID REFERENCES channels
  author_id       UUID REFERENCES users
  content         TEXT
  attachments     JSONB
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
  is_deleted      BOOLEAN DEFAULT false

-- Guestbook Entries
guestbook_entries
  id              UUID PRIMARY KEY
  page_owner_id   UUID REFERENCES users
  author_id       UUID REFERENCES users
  content         TEXT
  created_at      TIMESTAMP
  is_hidden       BOOLEAN DEFAULT false
```

---

## Workstream Breakdown

### 🔴 Workstream 1: Core Infrastructure
**Goal:** Auth, database, API skeleton - the foundation everything builds on.

**Tasks:**
- [ ] Project scaffolding (Next.js app, NestJS API, shared types)
- [ ] Database setup (Postgres with migrations via Prisma or Drizzle)
- [ ] Authentication system (JWT + refresh tokens, OAuth optional)
- [ ] User registration & login flows
- [ ] API structure and middleware (validation, error handling, rate limiting)
- [ ] Redis setup for sessions and caching
- [ ] S3/R2 setup for file uploads
- [ ] Basic CI/CD pipeline

**Deliverable:** Working auth flow, user can register/login, API scaffold ready for features.

---

### 🟡 Workstream 2: PixelPages (Profile System)
**Goal:** The star feature - customizable profile pages with CSS sandbox.

**Tasks:**
- [ ] Profile data model and API endpoints
- [ ] CSS sanitization engine (whitelist safe properties, block dangerous ones)
- [ ] Profile editor UI (live preview as you edit)
- [ ] Template system (pre-built themes users can start from)
- [ ] Profile sections (bio, music player, photo grid, widgets)
- [ ] Top Friends component (draggable ranking)
- [ ] Guestbook/wall system
- [ ] Profile sharing (public URLs)
- [ ] Theme marketplace (users can share their CSS)

**Deliverable:** Users can fully customize their profile page, view others' profiles, leave guestbook entries.

---

### 🟢 Workstream 3: Boxxes & Chat
**Goal:** Discord-style communities with real-time chat.

**Tasks:**
- [ ] Boxx CRUD operations
- [ ] Channel management within boxxes
- [ ] Member management (join, leave, roles)
- [ ] NATS integration for real-time messaging
- [ ] Message persistence and history loading
- [ ] Typing indicators and presence
- [ ] Direct messages (1:1 and groups)
- [ ] Emotes and reactions
- [ ] Message embeds (links, images)

**Deliverable:** Users can create/join boxxes, chat in real-time, DM each other.

---

### 🔵 Workstream 4: AI Layer
**Goal:** Intelligent features that make PixelBoxx magical.

**Tasks:**
- [ ] Profile design assistant API (Claude integration)
- [ ] "Make it look like this" - image to CSS generation
- [ ] Smart template suggestions
- [ ] Content moderation pipeline (vision model integration)
- [ ] CSS generation from natural language ("make it dark with neon accents")
- [ ] Moderation queue for flagged content
- [ ] Auto-moderation rules

**Deliverable:** Users can generate profiles from inspiration, content is automatically moderated.

---

### 🟣 Workstream 5: Frontend Shell & Design System
**Goal:** The app shell, navigation, and design system that ties it all together.

**Tasks:**
- [ ] Design system (colors, typography, spacing, components)
- [ ] Pixel art aesthetic implementation (the brand)
- [ ] App shell (navigation, sidebars, layout)
- [ ] Responsive design (mobile-first)
- [ ] Core components library (buttons, inputs, cards, modals)
- [ ] Animation system (micro-interactions, transitions)
- [ ] Loading states and skeletons
- [ ] Error boundaries and fallbacks
- [ ] Dark/light theme support

**Deliverable:** Polished, pixel-perfect app shell that everything else plugs into.

---

### 🟤 Workstream 6: Social Graph & Notifications
**Goal:** Friends, followers, and keeping users engaged.

**Tasks:**
- [ ] Friends system (add, accept, remove, block)
- [ ] Top Friends selection and ranking UI
- [ ] Follower system (optional public following)
- [ ] Friend activity feed
- [ ] Notification system (in-app + push)
- [ ] Notification preferences

**Deliverable:** Full social graph with friends, notifications keep users engaged.

---

## Parallel Execution Plan

```
Week 1-2: Foundation
├── WS1 (Infra) ─────────────▶ Auth + DB + API scaffold
├── WS5 (Frontend) ──────────▶ Design system + App shell
└── Design ──────────────────▶ Finalize brand, components, flows

Week 3-4: Core Features  
├── WS2 (PixelPages) ────────▶ Profile editor + CSS sandbox
├── WS3 (Chat) ──────────────▶ Real-time messaging foundation
└── WS1 (Infra) ─────────────▶ File uploads, caching

Week 5-6: Intelligence + Social
├── WS4 (AI) ────────────────▶ Design assistant + moderation
├── WS6 (Social) ────────────▶ Friends + notifications
└── WS2 (PixelPages) ────────▶ Templates + theme sharing

Week 7-8: Polish + Launch Prep
├── All streams ─────────────▶ Integration + bug fixes
├── Performance ─────────────▶ Optimization pass
└── Launch ──────────────────▶ Beta release
```

---

## Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | RSC, great DX, Vercel deployment |
| Styling | TailwindCSS + CSS Modules | Utility-first + scoped custom CSS |
| State | Zustand + React Query | Simple, performant, good caching |
| Backend API | NestJS | TypeScript, modular, production-ready |
| Real-time | NATS | Battle-tested, scalable, you know it well |
| Database | PostgreSQL | Reliable, feature-rich, great tooling |
| ORM | Prisma or Drizzle | Type-safe, migrations, good DX |
| Cache | Redis | Sessions, rate limiting, real-time state |
| Storage | Cloudflare R2 or S3 | Cost-effective object storage |
| Auth | Custom JWT + OAuth | Full control, or Clerk if faster |
| AI Design | Claude API | Best for creative generation |
| AI Moderation | GPT-4 Vision or Claude | Content safety scanning |
| Hosting | Vercel (FE) + Railway/Fly (BE) | Easy scaling, good DX |

---

## Open Questions

1. **Voice chat?** - Do we want Discord-style voice channels eventually? (Adds significant complexity)
2. **Mobile apps?** - PWA first, or native apps on roadmap?
3. **Monetization?** - Premium themes? Cosmetic upgrades? (But NOT gating customization behind paywall - that's the whole point)
4. **Age verification?** - How strict do we need to be for 13+ compliance?

---

## Workstreams

All detailed task breakdowns are in the `/workstreams` directory:

| Workstream | Document | Status |
|------------|----------|--------|
| WS1: Core Infrastructure | [WS1-INFRASTRUCTURE.md](./workstreams/WS1-INFRASTRUCTURE.md) | 📋 Ready |
| WS2: PixelPages (Profiles) | [WS2-PIXELPAGES.md](./workstreams/WS2-PIXELPAGES.md) | 📋 Ready |
| WS3: Boxxes & Chat | [WS3-BOXXES-CHAT.md](./workstreams/WS3-BOXXES-CHAT.md) | 📋 Ready |
| WS4: AI Layer | [WS4-AI-LAYER.md](./workstreams/WS4-AI-LAYER.md) | 📋 Ready |
| WS5: Frontend Shell | [WS5-FRONTEND-SHELL.md](./workstreams/WS5-FRONTEND-SHELL.md) | 📋 Ready |
| WS6: Social & Notifications | [WS6-SOCIAL-NOTIFICATIONS.md](./workstreams/WS6-SOCIAL-NOTIFICATIONS.md) | 📋 Ready |

---

## Next Steps

1. ✅ Architecture overview (this document)
2. ✅ Create detailed task lists per workstream (6 workstreams documented)
3. 🔲 Set up monorepo structure
4. 🔲 Initialize all project scaffolds
5. 🔲 Design system and component library
6. 🔲 Start parallel development

---

## For Parallel Agent Execution

Each workstream document contains:
- Detailed task breakdowns with estimates
- Database schemas (Prisma)
- API endpoint specifications
- File structure to create
- Dependencies on other workstreams
- Acceptance criteria
- Notes for agents

Agents can pick up any workstream and execute independently. WS1 (Infrastructure) has no blockers and should be started first. WS5 (Frontend Shell) can run in parallel with WS1.

---

*Built with ❤️ by a 12-year-old's vision, her dad's infrastructure chops, and Claude's design skills.*
