# ECX Forms - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository** - Push your code to GitHub
2. **Supabase Project** - Create a project at [supabase.com](https://supabase.com)
3. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
4. **Render Account** - Sign up at [render.com](https://render.com)

---

## Step 1: Database Setup (Supabase)

1. Create a new Supabase project
2. Go to **SQL Editor** and run the migrations in order:

```sql
-- Run these files in order:
-- 1. backend/supabase/migrations/001_initial_schema.sql
-- 2. backend/supabase/migrations/002_storage_bucket.sql
-- 3. backend/supabase/migrations/003_admins_table.sql
```

3. Get your credentials from **Settings > API**:
   - Project URL (`SUPABASE_URL`)
   - `anon` public key (`SUPABASE_ANON_KEY`)
   - `service_role` secret key (`SUPABASE_SERVICE_ROLE_KEY`)

---

## Step 2: Backend Deployment (Render)

### Option A: Deploy via Render Dashboard

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| Name | `ecx-forms-api` |
| Root Directory | `backend` |
| Environment | `Node` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

4. Add Environment Variables:

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://forms.ecx.com.ng
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MAX_FILE_SIZE_MB=2
```

5. Click **Create Web Service**

### Option B: Deploy via render.yaml Blueprint

The `backend/render.yaml` file contains the blueprint. Simply:
1. Push to GitHub
2. In Render, go to **Blueprints** → **New Blueprint Instance**
3. Select your repository

---

## Step 3: Frontend Deployment (Netlify)

### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend
cd frontend

# Initialize Netlify project (first time only)
netlify init

# Build and deploy
npm run build
netlify deploy --prod
```

### Option B: Deploy via Netlify Dashboard

1. Go to [netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/.next` |

4. Add Environment Variables in **Site settings > Environment variables**:

```
NEXT_PUBLIC_API_URL=https://ecx-forms-api.onrender.com/api/v1
NEXT_PUBLIC_APP_URL=https://forms.ecx.com.ng
```

5. Click **Deploy site**

---

## Step 4: Custom Domain Setup

### Netlify (Frontend)

1. Go to **Site settings** → **Domain management**
2. Add custom domain: `forms.ecx.com.ng`
3. Configure DNS:
   - Add CNAME record pointing to your Netlify site URL
   - Or use Netlify DNS

### Render (Backend)

1. Go to your web service → **Settings** → **Custom Domains**
2. Add domain: `api.forms.ecx.com.ng` (optional)
3. Configure DNS accordingly

---

## Quick Reference Commands

### Build Commands

```bash
# Backend
cd backend
npm run build          # Compile TypeScript
npm start              # Run production server

# Frontend
cd frontend
npm run build          # Build Next.js app
npm start              # Run production server locally
```

### Deploy Commands

```bash
# Netlify (after initial setup)
cd frontend
npm run build && netlify deploy --prod

# Render (auto-deploys on push)
git push origin main
```

---

## Environment Variables Summary

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://forms.ecx.com.ng` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | `eyJ...` |
| `MAX_FILE_SIZE_MB` | Max upload size | `2` |

### Frontend (Netlify)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://ecx-forms-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `https://forms.ecx.com.ng` |

---

## Troubleshooting

### Backend not starting on Render

- Check build logs for TypeScript errors
- Ensure all environment variables are set
- Verify `npm start` runs `node dist/index.js`

### Frontend build fails on Netlify

- Check if `@netlify/plugin-nextjs` is installed
- Verify Node version (should be 18+)
- Check environment variables are set

### CORS errors

- Ensure `FRONTEND_URL` is correctly set in backend
- Check that the URL includes `https://` and no trailing slash

### Database connection issues

- Verify Supabase credentials are correct
- Check if migrations have been run
- Ensure RLS policies are in place

---

## Production Checklist

- [ ] Database migrations run on Supabase
- [ ] Backend deployed on Render
- [ ] Backend environment variables set
- [ ] Frontend deployed on Netlify
- [ ] Frontend environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] Test login with `admin@ecx.com.ng` / `ecx@2026!`
- [ ] Test form creation and submission
- [ ] Test file uploads

---

## URLs

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | `http://localhost:3000` | `https://forms.ecx.com.ng` |
| Backend API | `http://localhost:3001` | `https://ecx-forms-api.onrender.com` |
| API Docs | `http://localhost:3001/api/v1/docs` | `https://ecx-forms-api.onrender.com/api/v1/docs` |
| Health Check | `http://localhost:3001/health` | `https://ecx-forms-api.onrender.com/health` |

