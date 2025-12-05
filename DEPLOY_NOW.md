# PixelBoxx Deployment - Your Checklist

Your repo: https://github.com/choose27/pixelboxx

## 🚂 Step 1: Deploy Backend to Railway (15 min)

### 1.1 Create New Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`choose27/pixelboxx`**
5. Railway will scan your repo

### 1.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates the database automatically
4. Note: You'll reference this as `${{Postgres.DATABASE_URL}}` in other services

### 1.3 Add Redis (Choose One Option)

**Option A: Railway Redis (uses your $5 credit)**
1. Click **"+ New"** → **"Database"** → **"Add Redis"**
2. Reference as `${{Redis.REDIS_URL}}`

**Option B: Upstash (100% free) - RECOMMENDED**
1. Go to https://console.upstash.com
2. Sign in with GitHub
3. Click **"Create Database"**
4. Choose **"Global"** or region near you
5. Copy the **"UPSTASH_REDIS_REST_URL"** (looks like `https://...upstash.io`)
6. We'll add this as `REDIS_URL` in Railway

### 1.4 Add NATS Message Bus

1. In Railway, click **"+ New"** → **"Empty Service"**
2. Name it `nats`
3. Go to **"Settings"** tab
4. Under **"Source"**, click **"Docker Image"**
5. Docker Image: `nats:latest`
6. Under **"Deploy"**, set:
   - **Start Command:** `-js -m 8222`
7. Click **"Deploy"**

### 1.5 Deploy AI Service (FastAPI)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select **`choose27/pixelboxx`**
3. Railway detects it's a monorepo
4. Configure the service:
   - Name: `ai-service`
   - **Root Directory:** `apps/ai-service`
   - **Build Command:** Leave empty (uses Dockerfile)
   - **Start Command:** Leave empty (uses Dockerfile)
   - **Watch Paths:** `apps/ai-service/**`

5. Go to **"Variables"** tab and add:

```env
API_KEY=dev-ai-service-key-12345
ANTHROPIC_API_KEY=sk-ant-your-key-here
ENABLE_MOCK_RESPONSES=true
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=*
DESIGNS_PER_HOUR=10
DESIGNS_PER_DAY=50
```

6. Click **"Deploy"** (bottom right)
7. Wait 2-3 minutes for build

### 1.6 Deploy API (NestJS)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select **`choose27/pixelboxx`**
3. Configure the service:
   - Name: `api`
   - **Root Directory:** `apps/api`
   - **Build Command:** Leave empty (uses Dockerfile)
   - **Start Command:** Leave empty (uses Dockerfile)
   - **Watch Paths:** `apps/api/**`

4. Go to **"Variables"** tab and add:

**Generate these secrets first:**
```bash
openssl rand -base64 32  # Copy this for JWT_SECRET
openssl rand -base64 32  # Copy this for JWT_REFRESH_SECRET
```

**Then add these variables:**

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NATS_URL=nats://nats.railway.internal:4222
JWT_SECRET=<paste-first-secret-here>
JWT_REFRESH_SECRET=<paste-second-secret-here>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
AI_SERVICE_URL=http://ai-service.railway.internal:8000
AI_SERVICE_API_KEY=dev-ai-service-key-12345
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://pixelboxx.vercel.app
```

**If using Upstash Redis (Option B):**
- Replace `REDIS_URL=${{Redis.REDIS_URL}}` with your Upstash URL

5. Go to **"Settings"** → **"Networking"**
6. Click **"Generate Domain"**
7. **COPY THIS URL** (e.g., `pixelboxx-api-production.up.railway.app`)
8. Click **"Deploy"**

### 1.7 Check Services Are Running

In Railway dashboard, you should see:
- ✅ `postgres` - Running
- ✅ `redis` (or Upstash external) - Running
- ✅ `nats` - Running
- ✅ `ai-service` - Running
- ✅ `api` - Running

Click each service and check **"Deployments"** tab for any errors.

**Test API:**
```bash
curl https://YOUR-API-DOMAIN.up.railway.app/api/health
```

You should see: `{"status":"healthy"}`

---

## ▲ Step 2: Deploy Frontend to Vercel (5 min)

### 2.1 Create New Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Find **`choose27/pixelboxx`** in your repos
4. Click **"Import"**

### 2.2 Configure Build Settings

Vercel auto-detects Next.js, but set these to be sure:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web` ← **IMPORTANT!**
- **Build Command:** `npm install && npm run build`
- **Output Directory:** Leave default (`.next`)
- **Install Command:** `npm install`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-API-DOMAIN.up.railway.app
NEXT_PUBLIC_WS_URL=wss://YOUR-RAILWAY-API-DOMAIN.up.railway.app
NODE_ENV=production
```

**Replace `YOUR-RAILWAY-API-DOMAIN` with the Railway domain you copied earlier!**

Example:
```env
NEXT_PUBLIC_API_URL=https://pixelboxx-api-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://pixelboxx-api-production.up.railway.app
```

### 2.4 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Vercel will give you a URL like: `pixelboxx.vercel.app`
4. **COPY THIS URL**

### 2.5 Update Railway API CORS

Go back to Railway:
1. Click on **`api`** service
2. Go to **"Variables"** tab
3. Update `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://pixelboxx.vercel.app,https://pixelboxx-api-production.up.railway.app
```

**Replace with YOUR actual Vercel URL!**

4. Click **"Deploy"** (Railway will restart the API)

---

## 🧪 Step 3: Test Everything (5 min)

### Test API Health

```bash
curl https://YOUR-RAILWAY-API-DOMAIN.up.railway.app/api/health
```

Should return:
```json
{"status":"healthy","service":"pixelboxx-api","timestamp":"...","version":"1.0.0"}
```

### Test User Registration

```bash
curl -X POST https://YOUR-RAILWAY-API-DOMAIN.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@pixelboxx.com",
    "password": "password123"
  }'
```

Should return user object with access token.

### Test Frontend

1. Visit **`https://pixelboxx.vercel.app`** (or your domain)
2. You should see the landing page with:
   - Floating pixel particles ✨
   - Neon pink/cyan glow effects
   - "YOUR SPACE. YOUR RULES." header
3. Try registering a user through the UI

### Test AI Service (Optional)

```bash
curl -X POST https://YOUR-RAILWAY-API-DOMAIN.up.railway.app/api/pixelpages/@testuser/design/from-description \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "description": "Dark theme with neon purple accents",
    "preferences": {"dark_mode": true}
  }'
```

---

## 🎉 You're Live!

**Your URLs:**
- Frontend: `https://pixelboxx.vercel.app`
- API: `https://YOUR-RAILWAY-API-DOMAIN.up.railway.app/api`
- API Health: `https://YOUR-RAILWAY-API-DOMAIN.up.railway.app/api/health`

**Auto-Deploy Enabled:**
```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Railway + Vercel auto-deploy in ~2-5 minutes! 🚀
```

---

## 🐛 Troubleshooting

### "Cannot connect to API" Error

**Check CORS:**
1. Railway → `api` service → Variables
2. Ensure `CORS_ORIGIN` includes your Vercel URL

### WebSocket Connection Failed

**Check WS URL:**
1. Vercel → Settings → Environment Variables
2. Ensure `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)

### API Service Failing to Start

**Check logs:**
1. Railway → `api` service → Deployments tab
2. Click latest deployment → View logs
3. Common issues:
   - Database migration failed (check Postgres is running)
   - Missing environment variable
   - Build error (check Dockerfile)

### Database Migration Issues

**Manual migration:**
1. Railway → `api` service → Variables
2. Add temporary variable: `RUN_MIGRATIONS=true`
3. Redeploy service

**Or use Railway CLI:**
```bash
railway login
railway link
railway run --service api npx prisma migrate deploy
```

### Redis Connection Failed

**If using Upstash:**
1. Check `REDIS_URL` format: `https://...upstash.io`
2. Verify Upstash database is active

**If using Railway Redis:**
1. Ensure Redis service is running
2. Check `${{Redis.REDIS_URL}}` reference is correct

### Build Failing on Railway

**Check build logs:**
1. Railway → Service → Deployments → Click deployment
2. Look for:
   - npm install errors
   - TypeScript errors
   - Dockerfile issues

**Common fixes:**
- Ensure Dockerfile exists in service directory
- Check package.json dependencies
- Verify Root Directory is set correctly

---

## 📊 Monitor Your Services

### Railway Dashboard
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time logging with search
- **Deployments:** Build history and rollback

### Vercel Dashboard
- **Analytics:** Page views, performance
- **Logs:** Function execution logs
- **Deployments:** Build history and preview URLs

---

## 💰 Cost Tracking

### Railway
- Dashboard → Usage
- **Free credit:** $5/month
- Monitor spend to avoid overages

### Vercel
- Dashboard → Usage
- **Free tier:** 100GB bandwidth/month
- Unlimited builds and deployments

**Expected monthly cost with low-moderate traffic: $0-3** 🎉

---

## 🚀 Next Steps

- [ ] Test registration and login flow
- [ ] Create a profile and customize with CSS
- [ ] Test AI design assistant (if using real Claude API)
- [ ] Create a Boxx (chat community)
- [ ] Invite friends to test!
- [ ] Add custom domain (Vercel Settings → Domains)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Share on social media!

---

**Need help?** Check the logs in Railway/Vercel dashboards or open an issue on GitHub!

**Good luck! 🎊**
