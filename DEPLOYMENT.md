# PixelBoxx - Deployment Guide (Free Tier)

Complete guide to deploying PixelBoxx to production using **100% free tier** services. Perfect for learning, MVPs, and hobby projects that can scale later.

## 🎯 Deployment Strategy Overview

We'll use these free services:

| Component | Service | Free Tier | Why |
|-----------|---------|-----------|-----|
| **Frontend (Next.js)** | Vercel | Unlimited | Made by Next.js creators, best DX |
| **Backend (NestJS)** | Railway | $5/month credit | Supports WebSockets, auto-deploys |
| **AI Service (FastAPI)** | Railway | Same $5 credit | Python support, same network as API |
| **PostgreSQL** | Railway | Included | 1GB storage, same network |
| **Redis** | Upstash | 10K requests/day | Serverless, global edge |
| **NATS** | Railway | Self-hosted | JetStream included |

**Total Cost:** $0/month for low-moderate traffic

## 📋 Prerequisites

1. GitHub account (for all services)
2. Anthropic API key (optional - mock mode works without it)
3. Git installed locally

## 🚀 Part 1: Deploy Backend Infrastructure (Railway)

Railway is perfect for our backend - it handles API, AI Service, PostgreSQL, Redis, and NATS in one place.

### Step 1: Push to GitHub

```bash
cd /Users/matt/Projects/pixelboxx

# Initialize git if not already done
git init
git add .
git commit -m "Initial PixelBoxx commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pixelboxx.git
git push -u origin main
```

### Step 2: Set Up Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `pixelboxx` repository
5. Railway will detect your monorepo

### Step 3: Configure PostgreSQL

1. In Railway dashboard, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway auto-generates `DATABASE_URL`
3. Copy this for later (or reference it as `${{Postgres.DATABASE_URL}}`)

### Step 4: Configure Redis (Alternative: Use Upstash)

**Option A: Railway Redis (uses your $5 credit)**
1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway auto-generates `REDIS_URL`

**Option B: Upstash (completely free tier)**
1. Go to https://upstash.com
2. Sign up with GitHub
3. Create new Redis database (Global or Regional)
4. Copy the `REDIS_URL` (REST URL for serverless)

### Step 5: Configure NATS

1. In Railway, click **"+ New"** → **"Empty Service"**
2. Name it `nats`
3. Go to **Settings** → **Deploy**
4. Set **Deploy Command:** `docker run -p 4222:4222 -p 8222:8222 nats:latest -js -m 8222`
5. Or create a simple Dockerfile in `/docker/nats/`:

```dockerfile
FROM nats:latest
CMD ["-js", "-m", "8222"]
```

### Step 6: Deploy API (NestJS)

1. In Railway, click **"+ New"** → **"GitHub Repo"**
2. Select your repo
3. Railway detects it as a monorepo
4. Configure service:
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma migrate deploy && npm run start:prod`
   - **Watch Paths:** `apps/api/**`

5. Set environment variables (Railway dashboard → Variables):

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NATS_URL=nats://nats.railway.internal:4222
JWT_SECRET=<generate-random-32-char-string>
JWT_REFRESH_SECRET=<generate-different-random-32-char-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
AI_SERVICE_URL=http://ai-service.railway.internal:8000
AI_SERVICE_API_KEY=<generate-random-api-key>
```

**Generate secrets:**
```bash
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 24  # AI_SERVICE_API_KEY
```

6. **Generate a Public Domain:**
   - Settings → Networking → Generate Domain
   - You'll get something like `pixelboxx-api-production.up.railway.app`
   - Copy this URL

### Step 7: Deploy AI Service (FastAPI)

1. Railway → **"+ New"** → **"GitHub Repo"**
2. Same repo, configure:
   - **Root Directory:** `apps/ai-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
   - **Watch Paths:** `apps/ai-service/**`

3. Set environment variables:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-or-leave-blank
API_KEY=<same-as-AI_SERVICE_API_KEY-from-api>
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://pixelboxx-api-production.up.railway.app
ENABLE_MOCK_RESPONSES=true
```

4. Generate public domain (optional - API can reach it via internal URL)

**Railway Internal Networking:**
Services communicate via `servicename.railway.internal:port` - this is private and fast!

## 🎨 Part 2: Deploy Frontend (Vercel)

Vercel is the gold standard for Next.js deployment.

### Step 1: Set Up Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `pixelboxx` repository

### Step 2: Configure Build Settings

Vercel auto-detects Next.js, but configure these:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `cd apps/web && npm install && npm run build`
- **Output Directory:** `apps/web/.next`
- **Install Command:** `npm install`

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://pixelboxx-api-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://pixelboxx-api-production.up.railway.app
NODE_ENV=production
```

**Important:**
- Railway domains support WebSockets automatically
- Use `wss://` (not `ws://`) for production

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys in ~2 minutes
3. You'll get a URL like `pixelboxx.vercel.app`
4. Add custom domain later (free with Vercel)

### Step 5: Update CORS in Railway API

Go back to Railway → API service → Variables:

```env
CORS_ORIGIN=https://pixelboxx.vercel.app,https://pixelboxx-api-production.up.railway.app
```

Redeploy API service.

## 🔐 Part 3: Database Migrations

Railway runs migrations automatically on deploy (we added `npx prisma migrate deploy` to start command).

**To create new migrations:**

```bash
# Locally
cd apps/api
npx prisma migrate dev --name your_migration_name

# Commit and push
git add .
git commit -m "Add migration: your_migration_name"
git push

# Railway auto-deploys and runs migration
```

## 🧪 Part 4: Testing Production

### Test Backend API

```bash
# Health check
curl https://pixelboxx-api-production.up.railway.app/api/health

# Register user
curl -X POST https://pixelboxx-api-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# Login
curl -X POST https://pixelboxx-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Test AI Service

```bash
curl https://your-ai-service.up.railway.app/health
```

### Test Frontend

Visit `https://pixelboxx.vercel.app` in your browser!

## 📊 Part 5: Monitoring & Logs

### Railway Logs

- Dashboard → Select service → **Deployments** tab
- Real-time logs with search/filter
- Click any deployment to see build logs

### Vercel Logs

- Dashboard → Select project → **Deployments** tab
- Real-time function logs
- Runtime logs for API routes

### Railway Metrics

- Dashboard → Select service → **Metrics** tab
- CPU, Memory, Network usage
- Auto-scales if needed (costs extra)

## 💰 Free Tier Limits

### Railway
- **$5/month credit** (covers all services with low traffic)
- Usage-based after credit runs out
- ~550 hours/month of 1GB container
- Estimated cost for low traffic: $3-8/month

### Vercel
- **100GB bandwidth/month**
- **Unlimited** builds & deployments
- **Serverless function executions:** 100GB-hours
- Estimated: Free for most hobby projects

### Upstash Redis
- **10,000 commands/day**
- **256MB storage**
- Estimated: Free for low-moderate traffic

**Total: $0-8/month depending on traffic**

## 🚀 Part 6: CI/CD (Auto-Deploy)

Both Railway and Vercel auto-deploy on git push!

### Auto-Deploy Flow

```
1. Make code changes locally
2. Commit and push to GitHub
   ↓
3. Vercel detects changes in apps/web → auto-deploys frontend
   Railway detects changes in apps/api → auto-deploys API
   Railway detects changes in apps/ai-service → auto-deploys AI
   ↓
4. Services automatically restart with new code
   ↓
5. Database migrations run automatically (API service)
   ↓
6. Live in ~2-5 minutes! 🎉
```

### Branch Previews (Vercel)

- Every git branch gets a preview URL
- Perfect for testing features before merging
- Example: `feature-chat.pixelboxx.vercel.app`

### Railway Environments

- Create separate environments (dev, staging, prod)
- Each with isolated databases
- Click **"+ New Environment"** in Railway

## 🎯 Part 7: Custom Domain (Free!)

### Add Domain to Vercel

1. Buy domain from Namecheap, Google Domains, etc. (~$10/year)
2. Vercel → Settings → Domains → Add `pixelboxx.com`
3. Update DNS records (Vercel provides instructions)
4. SSL auto-configured (free with Let's Encrypt)

### Add API Subdomain

1. Railway → API service → Settings → Networking
2. Add custom domain: `api.pixelboxx.com`
3. Update DNS with Railway's CNAME
4. SSL auto-configured

**Result:**
- Frontend: `https://pixelboxx.com`
- API: `https://api.pixelboxx.com`
- AI Service: `https://ai.pixelboxx.com` (optional)

## 🔄 Part 8: Alternative Free Tier Options

If Railway credit runs out or you want alternatives:

### Backend API Alternatives

**Render (Free Tier)**
- 750 hours/month free
- Spins down after 15 min inactivity (slow cold starts)
- Good for: Low-traffic hobby projects

**Fly.io (Free Tier)**
- 3 shared-cpu VMs (256MB each)
- 3GB persistent storage
- Good for: Full-stack apps with multiple services

**Heroku Alternatives (No Free Tier)**
- Heroku removed free tier in Nov 2022
- Consider Railway or Render instead

### Database Alternatives

**Supabase (Free Tier)**
- 500MB database
- 50K rows
- Includes auth, storage, real-time
- Good for: All-in-one backend

**Neon (Free Tier)**
- 10GB storage
- Serverless Postgres with autoscaling
- Good for: Database-only needs

**Vercel Postgres (Free Tier)**
- 256MB storage
- 60 compute hours/month
- Good for: Small projects on Vercel

### Redis Alternatives

**Vercel KV (Free Tier)**
- 256MB storage
- 3K commands/day
- Built on Upstash
- Good for: Vercel-hosted projects

**Redis Cloud (Free Tier)**
- 30MB storage
- 30 connections
- Good for: Minimal caching needs

## 📈 Part 9: Scaling Later

When PixelBoxx gets popular and you have budget:

### Railway Paid Plans
- **Developer:** $20/month
- **Team:** $100/month
- Includes more credits + team features

### Vercel Paid Plans
- **Pro:** $20/month/member
- Unlimited bandwidth
- Advanced analytics

### Database Scaling
- Railway Postgres: Scale storage/CPU
- Or migrate to:
  - **AWS RDS** ($15-50/month)
  - **Digital Ocean Managed DB** ($15/month)
  - **Supabase Pro** ($25/month)

### Redis Scaling
- Upstash Pro: $10-50/month
- AWS ElastiCache: $15-100/month
- Redis Cloud: $7-100/month

**Estimated cost at 10K users:** $50-150/month

## 🛠️ Part 10: Deployment Checklist

Before going live:

- [ ] Change all secrets (JWT, API keys) to production values
- [ ] Set `NODE_ENV=production` everywhere
- [ ] Set `ENABLE_MOCK_RESPONSES=false` if using real Claude API
- [ ] Add real `ANTHROPIC_API_KEY` if using AI features
- [ ] Configure `CORS_ORIGIN` with production domains
- [ ] Test auth flow end-to-end
- [ ] Test AI design generation
- [ ] Test real-time chat (WebSocket connection)
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Configure backups (Railway auto-backups databases)
- [ ] Add custom domain
- [ ] Test on mobile devices
- [ ] Set up analytics (Vercel Analytics free)
- [ ] Add privacy policy & terms (if collecting user data)

## 🎓 Learning Resources

### Vercel
- Docs: https://vercel.com/docs
- Next.js deployment: https://nextjs.org/docs/deployment

### Railway
- Docs: https://docs.railway.app
- Templates: https://railway.app/templates

### Upstash
- Docs: https://docs.upstash.com
- Redis guide: https://upstash.com/docs/redis

## 🚨 Common Issues

### CORS Errors
- Ensure `CORS_ORIGIN` in API matches frontend URL exactly
- Include both `http://` and `https://` if testing locally + prod
- Railway/Vercel domains change - update env vars

### WebSocket Connection Failed
- Use `wss://` (not `ws://`) in production
- Railway supports WebSockets by default
- Check firewall/proxy settings

### Database Connection Timeout
- Railway internal URLs: `servicename.railway.internal`
- External URLs use public domain
- Verify `DATABASE_URL` format

### AI Service 500 Errors
- Check `ANTHROPIC_API_KEY` is valid
- Or set `ENABLE_MOCK_RESPONSES=true`
- Verify `AI_SERVICE_API_KEY` matches between services

### Cold Starts (Render Free Tier)
- Services spin down after 15 min inactivity
- First request takes 30-60 seconds
- Consider Railway ($5 credit) or Fly.io instead

## 🎉 You're Live!

Congratulations! You've deployed a full-stack, real-time, AI-powered application to production using free tier services.

**What you learned:**
- Monorepo deployment strategies
- Environment variable management
- Service-to-service communication
- Auto-deploy CI/CD pipelines
- Database migrations in production
- WebSocket deployment
- Free tier optimization

**Next steps:**
- Share with friends and get feedback
- Monitor usage and costs
- Scale services as needed
- Add custom domain
- Set up analytics

---

**Questions? Issues?** Check Railway/Vercel community docs or open a GitHub issue!

**Want to contribute?** PixelBoxx is open-source (if you make it so)!

🚀 **Happy deploying!**
