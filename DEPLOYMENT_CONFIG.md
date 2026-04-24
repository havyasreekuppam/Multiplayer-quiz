# DEPLOYMENT CONFIGURATION GUIDE

Complete guide for deploying the Quiz Battle platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment](#vercel-deployment)
3. [Render Deployment](#render-deployment)
4. [MongoDB Atlas Setup](#mongodb-atlas-setup)
5. [Environment Configuration](#environment-configuration)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Production Monitoring](#production-monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 14+ installed
- Git repository (GitHub/GitLab/Bitbucket)
- MongoDB Atlas account
- Vercel account (for frontend)
- Render account (for backend)

---

## Vercel Deployment

### Frontend Deployment (React App)

#### Step 1: Prepare Build

```bash
cd client

# Install dependencies
npm install

# Test build locally
npm run build

# Should create a `build/` folder
```

#### Step 2: Create vercel.json

Already included at `/client/vercel.json`

#### Step 3: Deploy

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from client directory
cd client
vercel --prod

# Follow prompts to link project
```

**Option B: GitHub Integration**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import GitHub repository
5. Select `./client` as root directory
6. Add environment variables
7. Click Deploy

#### Step 4: Configure Environment Variables

In Vercel Dashboard:

1. Go to Settings → Environment Variables
2. Add:

```
REACT_APP_API_URL = https://your-backend.render.com/api
REACT_APP_SOCKET_URL = https://your-backend.render.com
```

3. Re-deploy to apply changes

#### Step 5: Custom Domain (Optional)

1. Vercel Settings → Domains
2. Add your domain
3. Update DNS records:

```
CNAME: your-domain.com → cname.vercel.app
```

---

## Render Deployment

### Backend Deployment (Node.js Server)

#### Step 1: Prepare Backend

```bash
cd server

# Install dependencies
npm install

# Test locally
npm run dev
```

#### Step 2: Create render.yaml

Already included at `/render.yaml`

#### Step 3: Deploy to Render

**Option A: Manual Setup**

1. Go to [render.com](https://render.com)
2. Dashboard → New → Web Service
3. Connect GitHub repository
4. Select `server` directory
5. Select Node environment
6. Set build: `npm install`
7. Set start: `npm start`
8. Click Deploy

**Option B: Using render.yaml**

```bash
# Push to GitHub
git add render.yaml
git commit -m "Add Render configuration"
git push

# Render auto-detects render.yaml
```

#### Step 4: Configure Environment Variables

In Render Dashboard:

1. Go to your service → Environment
2. Add the following:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Your Vercel frontend URL |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NODE_ENV` | `production` |

#### Step 5: Configure Webhooks

1. Deploy Hook → Create URL
2. Use for automatic redeploys on GitHub push

---

## MongoDB Atlas Setup

### Create Free Cluster

#### Step 1: Sign Up

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create account
3. Create organization and project

#### Step 2: Create Cluster

1. Clusters → Create
2. Select Shared (Free)
3. Choose region closest to you
4. Click Create Cluster
5. Wait 3-5 minutes for creation

#### Step 3: Setup Database User

1. Security → Database Users
2. Add User
3. Username: `quiz-battle`
4. Password: Generate secure password (save it!)
5. Role: `readWriteAnyDatabase`

#### Step 4: Whitelist IPs

1. Security → IP Access List
2. Add Entry
3. IP Address: Select "Allow Access from Anywhere"
   - Or add specific IPs:
     - Vercel: `76.75.126.0/24`
     - Render: Your app's static IP

#### Step 5: Get Connection String

1. Clusters → Connect
2. Select "Connect your application"
3. Copy connection string
4. Replace `<username>` and `<password>`

Example:
```
mongodb+srv://quiz-battle:password@cluster.mongodb.net/quiz_battle?retryWrites=true&w=majority
```

#### Step 6: Create Database

1. Collections → Create Database
2. Database: `quiz_battle`
3. Collection: `users`
4. Click Create
5. Repeat for other collections as needed

---

## Environment Configuration

### Backend .env File

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://quiz-battle:password@cluster.mongodb.net/quiz_battle?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-generate-with-openssl
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app

# OpenAI (Optional)
OPENAI_API_KEY=sk-your-api-key

# Logging
LOG_LEVEL=info
```

### Frontend .env File

```bash
# API Configuration
REACT_APP_API_URL=https://your-backend.render.com/api
REACT_APP_SOCKET_URL=https://your-backend.render.com

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_RANKING=true
```

### Generate JWT Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Output example:
# K7mX9qL2pR8vT5nJ3bZ6wY1sH4dF0cX2eQ7rU9aO5mI8l

# Use this value for JWT_SECRET
```

---

## CI/CD Pipeline

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Test Backend
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd server && npm install
      
      - name: Run tests (if any)
        run: cd server && npm test || true
      
      - name: Lint
        run: cd server && npm run lint || true

  # Test Frontend
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd client && npm install
      
      - name: Build
        run: cd client && npm run build
      
      - name: Run tests (if any)
        run: cd client && npm test || true

  # Deploy to Vercel (Frontend)
  deploy-frontend:
    needs: test-frontend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: client
          production: true

  # Deploy to Render (Backend)
  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Render
        run: |
          # Render auto-deploys on git push
          # This is just a notification step
          echo "Backend deploying via Render webhook..."
```

### Setup Secrets

1. GitHub → Settings → Secrets
2. Add:
   - `VERCEL_TOKEN`: Get from vercel.com/account/tokens
   - `VERCEL_ORG_ID`: From Vercel team settings
   - `VERCEL_PROJECT_ID`: From project settings

---

## Production Monitoring

### Vercel Analytics

1. Dashboard → Settings → Analytics
2. Monitor:
   - Page performance
   - Core Web Vitals
   - Error rates

### Render Logs

1. Service page → Logs
2. Monitor:
   - Application logs
   - Deploy logs
   - Error messages

### MongoDB Atlas Monitoring

1. Monitoring tab
2. Review:
   - Connection count
   - Query performance
   - Storage usage

### Add Error Tracking (Sentry)

```bash
# Install Sentry SDK
npm install @sentry/node

# Backend integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Troubleshooting

### Deployment Issues

#### "Vercel build fails"
```
Solution: Check build logs in Vercel dashboard
1. Verify package.json has correct scripts
2. Ensure all dependencies are installed
3. Check for environment variable issues
```

#### "Backend won't start on Render"
```
Solution:
1. Check application logs in Render dashboard
2. Verify all environment variables are set
3. Test locally: npm run dev
4. Check MongoDB connection string
```

#### "CORS errors"
```
Solution:
1. Verify CORS_ORIGIN matches frontend URL
2. Check in server.js config
3. Restart backend after changing CORS_ORIGIN
```

#### "Socket connection fails"
```
Solution:
1. Verify REACT_APP_SOCKET_URL is correct backend URL
2. Check if backend is running and accessible
3. Browser console → Network tab → check WebSocket connection
```

### Database Issues

#### "MongoDB connection timeout"
```
Solution:
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string
3. Test connection: mongosh <connection-string>
```

#### "Collection not found"
```
Solution:
1. Manually create collections in MongoDB Atlas
2. Or let application create them on first use
3. Check collection names match in code
```

### Performance Issues

#### "Slow API responses"
```
Solution:
1. Check MongoDB query performance
2. Add database indexes
3. Enable caching in backend
4. Review slow query logs
```

#### "High memory usage"
```
Solution:
1. Check for memory leaks in Node process
2. Monitor with: ps aux | grep node
3. Restart server if needed
4. Review large array operations
```

---

## Maintenance

### Regular Backups

```bash
# Backup MongoDB (via Atlas)
1. Go to MongoDB Atlas Dashboard
2. Clusters → Backup & Restore
3. Set to daily automatic backups
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update safely
npm update

# Major version updates
npm install package@latest
```

### Monitor Costs

- **Vercel**: Free tier with usage limits
- **Render**: Free tier with limited hours
- **MongoDB Atlas**: Free tier with 10GB storage

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL/HTTPS working
- [ ] Custom domain set up
- [ ] Monitoring enabled
- [ ] Error logging configured
- [ ] Performance optimized
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

---

**Successfully deployed? 🎉**

Monitor your application and make improvements based on real user feedback!
