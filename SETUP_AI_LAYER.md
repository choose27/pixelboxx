# AI Layer Setup Instructions

## Quick Setup Guide

Follow these steps to get the AI Layer integration up and running.

---

## Step 1: Database Migration

The ModerationQueue model needs to be added to your database.

```bash
cd /Users/matt/Projects/pixelboxx/apps/api

# Create and run the migration
npx prisma migrate dev --name add-moderation-queue

# Generate Prisma client with new types
npx prisma generate
```

**What this does:**
- Creates the `moderation_queue` table
- Adds `ContentType` enum (PROFILE_IMAGE, GALLERY_IMAGE, MESSAGE, GUESTBOOK, CUSTOM_EMOTE)
- Adds `ModerationStatus` enum (PENDING, APPROVED, REJECTED, ESCALATED)

---

## Step 2: Configure Environment Variables

### Backend (apps/api/.env)

Add these lines to your `.env` file:

```bash
# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=internal-service-key
```

**Note:** These are already in `.env.example`, but make sure they're in your actual `.env` file.

### Frontend (apps/web/.env.local)

Verify this exists (should already be there):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Step 3: Install Dependencies (if needed)

The AI service module uses `form-data` for multipart uploads.

```bash
cd /Users/matt/Projects/pixelboxx/apps/api
npm install form-data @types/multer
```

---

## Step 4: Start All Services

You need to run 3 services for the full AI layer to work:

### Terminal 1: AI Service (Python FastAPI)

```bash
cd /Users/matt/Projects/pixelboxx/apps/ai-service
./run.sh
```

**Expected output:**
```
Starting PixelBoxx AI Service...
Environment: development
Mock Mode: true
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Backend (NestJS)

```bash
cd /Users/matt/Projects/pixelboxx/apps/api
npm run start:dev
```

**Expected output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [NestApplication] Nest application successfully started
```

### Terminal 3: Frontend (Next.js)

```bash
cd /Users/matt/Projects/pixelboxx/apps/web
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

---

## Step 5: Verify Setup

### Check AI Service Health

```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "pixelboxx-ai-service",
  "timestamp": "2025-12-04T...",
  "version": "1.0.0"
}
```

### Check Backend API

```bash
curl http://localhost:3001
```

Should return some response (even if it's a 404, it means the server is running).

### Check Frontend

Open http://localhost:3000 in your browser. The app should load.

---

## Step 6: Test the Integration

### Via Frontend UI (Recommended)

1. Log in to PixelBoxx
2. Navigate to your profile editor
3. Look for the "AI Assist" button
4. Click it to open the AI Design Assistant modal
5. Try generating CSS:
   - **From Image:** Upload any image and click "Generate CSS"
   - **From Description:** Enter "Dark with neon purple accents" and click "Generate CSS"
6. Preview the generated CSS
7. Click "Apply to Profile"

### Via API (Direct Testing)

First, get your JWT token by logging in, then:

```bash
# Test image-to-CSS generation
curl -X POST http://localhost:3001/pixelpages/me/design/from-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F 'preferences={"dark_mode": true}'

# Test description-to-CSS generation
curl -X POST http://localhost:3001/pixelpages/me/design/from-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Dark with neon purple accents", "preferences": {"dark_mode": true}}'
```

---

## Troubleshooting

### Issue: "AI service health check failed"

**Solution:**
- Make sure AI service is running on port 8000
- Check `AI_SERVICE_URL` in backend .env
- Verify the AI service is accessible: `curl http://localhost:8000/health`

### Issue: "Failed to generate design from image"

**Possible causes:**
1. AI service not running
2. Invalid API key
3. File too large (>10MB)
4. Invalid file type (must be image)

**Debug:**
```bash
# Check AI service logs
cd /Users/matt/Projects/pixelboxx/apps/ai-service
# Look at terminal output when you make request

# Check backend logs
cd /Users/matt/Projects/pixelboxx/apps/api
# Look at NestJS console output
```

### Issue: "Moderation queue not found"

**Solution:**
- Run the Prisma migration: `npx prisma migrate dev`
- Regenerate client: `npx prisma generate`
- Restart the backend

### Issue: Frontend can't connect to backend

**Solution:**
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`
- Check backend is running on port 3001
- Check browser console for CORS errors

### Issue: Image upload not working

**Possible causes:**
1. File too large (max 10MB)
2. Invalid file type
3. Missing multer dependency

**Solution:**
```bash
cd /Users/matt/Projects/pixelboxx/apps/api
npm install @types/multer
```

---

## Development Workflow

### Working on AI Features

1. **AI Service** (Python FastAPI)
   - Edit files in `apps/ai-service/`
   - Service auto-reloads on changes
   - Test with `curl` or the frontend

2. **Backend** (NestJS)
   - Edit files in `apps/api/src/ai-service/` or `apps/api/src/moderation/`
   - NestJS auto-reloads on changes
   - Watch console for errors

3. **Frontend** (Next.js)
   - Edit files in `apps/web/src/components/pixelpage/`
   - Next.js hot reloads changes instantly
   - Check browser console for errors

### Database Changes

If you modify the Prisma schema:

```bash
cd /Users/matt/Projects/pixelboxx/apps/api
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

Then restart the backend.

---

## Production Deployment

When deploying to production:

1. **Set real AI service credentials:**
   ```bash
   AI_SERVICE_URL=https://ai.yourpixelboxx.com
   AI_SERVICE_API_KEY=your-secure-random-key
   ```

2. **Disable mock mode in AI service:**
   ```bash
   ENABLE_MOCK_RESPONSES=false
   ANTHROPIC_API_KEY=your-real-claude-api-key
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Set secure CORS origins:**
   ```bash
   CORS_ORIGIN=https://yourpixelboxx.com
   ```

---

## What's Working Now

After completing this setup:

✅ Users can upload inspiration images
✅ AI analyzes images and generates CSS
✅ Users can describe designs in text
✅ AI generates CSS from descriptions
✅ Design preferences control AI output
✅ Generated CSS includes color palettes
✅ Moderation queue tracks content (auto-approves)
✅ Admin endpoints for moderation review

---

## What Needs Real AI (Currently Placeholders)

🔄 Image moderation (auto-approves for now)
🔄 Text moderation (auto-approves for now)
🔄 Template recommendations
🔄 Design refinement chat

These are marked with TODO comments in the code and have infrastructure ready for implementation.

---

## Files to Know

### Backend
- `apps/api/src/ai-service/ai-service.service.ts` - AI service HTTP client
- `apps/api/src/pixelpages/pixelpages.controller.ts` - AI design endpoints
- `apps/api/src/moderation/moderation.service.ts` - Moderation logic
- `apps/api/prisma/schema.prisma` - Database models

### Frontend
- `apps/web/src/components/pixelpage/AIDesignAssistant.tsx` - Main modal
- `apps/web/src/components/pixelpage/DesignPreferencesForm.tsx` - Preferences UI
- `apps/web/src/lib/api-client.ts` - API calls

### AI Service
- `apps/ai-service/api/design.py` - Design generation endpoints
- `apps/ai-service/services/claude.py` - Claude API wrapper
- `apps/ai-service/prompts/design_prompts.py` - AI prompts

---

## Getting Help

Check these resources:
- **AI Service README:** `/apps/ai-service/README.md`
- **Integration Summary:** `/AI_LAYER_INTEGRATION_SUMMARY.md`
- **Frontend Guide:** `/apps/web/INTEGRATION_GUIDE.md`
- **Architecture:** `/ARCHITECTURE.md`
- **Workstream:** `/workstreams/WS4-AI-LAYER.md`

For issues, check:
1. Terminal logs (all 3 services)
2. Browser console (frontend errors)
3. Network tab (API request/response)

---

You're all set! The AI Design Assistant is ready to make profile customization magical. 🎨✨
