# Boxxes & Chat - Quick Start Guide

## Start Everything in 3 Steps

### 1. Start Docker Services (Postgres, Redis, NATS)
```bash
cd /Users/matt/Projects/pixelboxx
docker-compose up -d

# Wait for services to be healthy (~10 seconds)
docker ps  # Check all are "healthy"
```

### 2. Start Backend API
```bash
cd apps/api
npm run start:dev
```

Backend runs at: **http://localhost:3001**

### 3. Start Frontend
```bash
cd apps/web
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Test Real-time Messaging

1. **Create a Boxx:**
   - Go to http://localhost:3000/boxxes
   - Click "Create Boxx"
   - Enter a name

2. **Open Two Browser Windows:**
   - Window 1: Your boxx page
   - Window 2: Same boxx page (different browser/incognito)

3. **Send a Message:**
   - Type in Window 1
   - Press Enter
   - See it appear instantly in Window 2!

4. **Test Typing Indicators:**
   - Start typing in Window 1
   - See "User is typing..." in Window 2

---

## Key Endpoints

### REST API (http://localhost:3001)

**Boxxes:**
- GET `/boxxes` - List public boxxes
- POST `/boxxes` - Create boxx
- GET `/boxxes/:slug` - Get boxx details
- POST `/boxxes/:id/join` - Join boxx

**Messages:**
- GET `/channels/:id/messages` - Get history
- POST `/channels/:id/messages` - Send message
- POST `/messages/:id/reactions` - Add reaction

**Presence:**
- GET `/presence/boxxes/:id/online` - Get online members

### WebSocket (ws://localhost:3001/ws)

Connect with JWT token, then:
- Emit `subscribe-channel` with `{channelId}`
- Emit `typing` with `{channelId, boxxId}`
- Listen for `message` events
- Listen for `user-typing` events

---

## Monitoring

- **NATS Dashboard:** http://localhost:8222
- **Postgres:** localhost:5432 (pixelboxx/pixelboxx)
- **Redis:** localhost:6379

---

## Stop Everything

```bash
# Stop frontend: Ctrl+C
# Stop backend: Ctrl+C
docker-compose down  # Stop Docker services
```

---

## File Structure Overview

```
apps/
├── api/src/
│   ├── nats/          # NATS messaging
│   ├── boxxes/        # Boxx CRUD
│   ├── channels/      # Channel management
│   ├── messages/      # Messages + WebSocket
│   └── presence/      # Online/offline tracking
└── web/src/
    ├── app/boxxes/    # Pages
    ├── components/chat/  # Chat UI
    └── hooks/         # Real-time hooks
```

---

## Environment Files

Already configured:
- `apps/api/.env` - Backend config (DB, NATS, Redis)
- `apps/web/.env.local` - Frontend config (API URL, WS URL)

---

## Common Issues

**"Can't reach database":**
```bash
docker-compose up -d postgres
```

**"NATS connection failed":**
```bash
docker-compose up -d nats
```

**"WebSocket won't connect":**
- Check token in localStorage
- Check CORS settings in backend

---

See `BOXXES_CHAT_SUMMARY.md` for complete documentation!
