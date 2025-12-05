# PixelBoxx - Deploy Quickstart (5 Minutes)

Ultra-fast deployment guide. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed explanations.

## Step 1: Push to GitHub (2 min)

```bash
cd /Users/matt/Projects/pixelboxx

# If not already a git repo:
git init
git add .
git commit -m "Initial commit - ready to deploy"

# Create repo on GitHub (github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/pixelboxx.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway (10 min)

1. **Sign up:** https://railway.app (use GitHub)
2. **New Project** → **Deploy from GitHub** → Select `pixelboxx`

3. **Add PostgreSQL:**
   - Click **"+ New"** → **Database** → **PostgreSQL**
   - Copy `DATABASE_URL` (or use `${{Postgres.DATABASE_URL}}`)

4. **Add Redis:**
   - **Option A:** Railway → **"+ New"** → **Database** → **Redis**
   - **Option B:** Upstash (free) → https://upstash.com → Create database

5. **Add NATS:**
   - Click **"+ New"** → **Empty Service** → Name: `nats`
   - Settings → **Source** → **Docker Image:** `nats:latest`
   - Start Command: `-js -m 8222`

6. **Deploy API:**
   - **"+ New"** → **GitHub Repo** → `pixelboxx`
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma migrate deploy && npm run start:prod`
   - **Watch Paths:** `apps/api/**`

   **Environment Variables:**
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   NATS_URL=nats://nats.railway.internal:4222
   JWT_SECRET=GENERATE_RANDOM_32_CHARS
   JWT_REFRESH_SECRET=GENERATE_DIFFERENT_RANDOM_32_CHARS
   AI_SERVICE_URL=http://ai-service.railway.internal:8000
   AI_SERVICE_API_KEY=GENERATE_RANDOM_24_CHARS
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://pixelboxx.vercel.app
   ```

   **Generate Secrets:**
   ```bash
   openssl rand -base64 32  # JWT_SECRET
   openssl rand -base64 32  # JWT_REFRESH_SECRET
   openssl rand -base64 24  # AI_SERVICE_API_KEY
   ```

   - Settings → **Networking** → **Generate Domain**
   - Copy domain (e.g., `pixelboxx-api.up.railway.app`)

7. **Deploy AI Service:**
   - **"+ New"** → **GitHub Repo** → `pixelboxx`
   - **Root Directory:** `apps/ai-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
   - **Watch Paths:** `apps/ai-service/**`

   **Environment Variables:**
   ```env
   API_KEY=SAME_AS_AI_SERVICE_API_KEY_FROM_API
   ANTHROPIC_API_KEY=sk-ant-optional-or-use-mock
   ENABLE_MOCK_RESPONSES=true
   ENVIRONMENT=production
   HOST=0.0.0.0
   PORT=8000
   ALLOWED_ORIGINS=https://pixelboxx.vercel.app,https://pixelboxx-api.up.railway.app
   ```

## Step 3: Deploy Frontend to Vercel (5 min)

1. **Sign up:** https://vercel.com (use GitHub)
2. **Add New Project** → Import `pixelboxx` repo

3. **Configure:**
   - **Framework:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd apps/web && npm install && npm run build`
   - **Output Directory:** `apps/web/.next`

4. **Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-API-DOMAIN.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://YOUR-RAILWAY-API-DOMAIN.up.railway.app
   NODE_ENV=production
   ```

5. **Deploy!** (takes ~2 minutes)

6. **Copy Vercel URL** (e.g., `pixelboxx.vercel.app`)

7. **Update Railway API CORS:**
   - Railway → API Service → Variables
   - Update `CORS_ORIGIN` to include your Vercel URL
   - Redeploy

## Step 4: Test (2 min)

```bash
# Test API health
curl https://YOUR-RAILWAY-API.up.railway.app/api/health

# Test frontend
open https://YOUR-VERCEL-APP.vercel.app

# Register user in browser or:
curl -X POST https://YOUR-RAILWAY-API.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "email": "demo@test.com", "password": "password123"}'
```

## 🎉 You're Live!

- **Frontend:** https://YOUR-APP.vercel.app
- **API:** https://YOUR-API.up.railway.app/api
- **Cost:** $0-5/month (Railway credit covers it)

## Auto-Deploy Setup ✅

Already done! Both Railway and Vercel auto-deploy on `git push`:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Railway + Vercel auto-detect and deploy
# Live in ~2-5 minutes!
```

## Common Environment Variables

**Generate Random Secrets:**
```bash
# macOS/Linux
openssl rand -base64 32

# Or use: https://randomkeygen.com/
```

**Railway Variables Shortcuts:**
- `${{Postgres.DATABASE_URL}}` - Auto-references PostgreSQL
- `${{Redis.REDIS_URL}}` - Auto-references Redis
- `${{RAILWAY_PUBLIC_DOMAIN}}` - Your service's public URL

**Vercel Variables:**
- Must start with `NEXT_PUBLIC_` to be available in browser
- Other vars only available server-side

## Troubleshooting

**CORS Errors:**
```bash
# Railway API → Variables → CORS_ORIGIN
CORS_ORIGIN=https://your-app.vercel.app
```

**WebSocket Connection Failed:**
```bash
# Vercel → Environment Variables
NEXT_PUBLIC_WS_URL=wss://your-api.up.railway.app  # Note: wss:// not ws://
```

**Database Migration Failed:**
```bash
# Railway → API Service → Logs
# Look for Prisma errors
# May need to run manually:
npx prisma migrate deploy
```

**AI Service 500 Error:**
```bash
# Check AI Service logs in Railway
# Verify API_KEY matches between API and AI Service
# Or enable mock mode:
ENABLE_MOCK_RESPONSES=true
```

## Next Steps

- [ ] Add custom domain (Vercel: free SSL)
- [ ] Set up monitoring (Sentry free tier)
- [ ] Enable Vercel Analytics (free)
- [ ] Add Anthropic API key for real AI features
- [ ] Invite friends to test!

## Free Tier Limits

- **Railway:** $5/month credit (~550 hours)
- **Vercel:** 100GB bandwidth/month
- **Upstash Redis:** 10K commands/day
- **Total:** Free for hobby/MVP projects

See [DEPLOYMENT.md](./DEPLOYMENT.md) for scaling, alternatives, and detailed explanations.

---

**Deployment time: ~20 minutes total** ⚡
