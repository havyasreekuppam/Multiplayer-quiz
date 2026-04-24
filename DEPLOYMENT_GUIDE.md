# 🚀 Production Deployment Guide

## Prerequisites

- Node.js 14+
- MongoDB Atlas account (or local MongoDB)
- Git
- Heroku CLI (for Heroku deployment)
- Vercel CLI (for Vercel deployment)

---

## 1. Environment Setup

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-battle
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx (optional)
SOCKET_PORT=5000
```

### Frontend (.env.local)

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_SOCKET_API_URL=https://yourdomain.com
```

---

## 2. MongoDB Setup (Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **Free Tier Cluster**
3. Create a database user with username/password
4. Get connection string
5. Replace in your `.env` file

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quiz-battle?retryWrites=true&w=majority
```

---

## 3. Backend Deployment

### Option A: Heroku

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create quiz-battle-backend

# 3. Set environment variables
heroku config:set PORT=5000
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main

# 5. View logs
heroku logs --tail
```

### Option B: Render

1. Go to [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add Environment Variables from `.env`
7. Deploy

**Backend URL:** `https://quiz-battle-backend.onrender.com`

### Option C: AWS/DigitalOcean

1. SSH into server
2. Install Node.js, MongoDB
3. Clone repository
4. Run `npm install && npm start`
5. Use PM2 to manage process: `pm2 start server.js`

---

## 4. Frontend Deployment

### Option A: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
```

### Option B: Netlify

```bash
# 1. Build react app
npm run build

# 2. Deploy using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=build

# 3. Set environment variables in Netlify dashboard
```

### Option C: GitHub Pages

```bash
# 1. Update package.json
"homepage": "https://yourusername.github.io/quiz-battle"

# 2. Install gh-pages
npm install --save-dev gh-pages

# 3. Add deploy scripts
"deploy": "npm run build && gh-pages -d build"

# 4. Deploy
npm run deploy
```

---

## 5. String DNS & HTTPS

### For Vercel/Netlify (automatic HTTPS):
- No additional setup needed
- SSL certificate included

### For Custom Domain:
1. Buy domain from Namecheap/GoDaddy
2. Point DNS to your server
3. Enable CORS on backend with your domain

---

## 6. Database Backup

### MongoDB Atlas (automatic):
- Snapshots every 6 hours
- 7-day retention

### Manual Backup:
```bash
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/quiz-battle" --out backup/
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/quiz-battle" backup/quiz-battle
```

---

## 7. Scaling & Performance

### Frontend Optimization:
```bash
# Code splitting
npm install react-code-splitting

# Image optimization
npm install next-image-optimization

# Monitor performance
npm install react-performance-monitoring
```

### Backend Optimization:
```bash
# Caching
npm install redis

# Rate limiting
npm install express-rate-limit

# Compression
npm install compression
```

### Setup Redis for caching:
```env
REDIS_URL=redis://user:password@hostname:port
```

---

## 8. Monitoring & Logging

### Error Tracking (Sentry):
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### Log Management:
```bash
npm install winston
```

---

## 9. CI/CD Pipeline (GitHub Actions)

### `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - run: npm test
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "quiz-battle-backend"
```

---

## 10. API Versioning & Security

### API Version Headers:
```javascript
app.use((req, res, next) => {
  res.set('API-Version', '1.0.0');
  next();
});
```

### Security Headers:
```javascript
npm install helmet

const helmet = require('helmet');
app.use(helmet());
```

### Rate Limiting:
```javascript
npm install express-rate-limit

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

---

## 11. Performance Benchmarks

**Target Metrics:**
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- API Response Time: < 200ms
- Database Query: < 100ms

**Tools for monitoring:**
- Google Lighthouse
- WebPageTest
- New Relic APM
- DataDog monitoring

---

## 12. Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify JWT token expiration
- [ ] Check CORS configuration
- [ ] Test real-time Socket.io connection
- [ ] Verify database backups
- [ ] Monitor error logs
- [ ] Test file uploads (if any)
- [ ] SSL certificate validity
- [ ] Rate limiting working
- [ ] Email notifications (if any)
- [ ] Payment processing (if any)
- [ ] Analytics tracking

---

## 13. Troubleshooting

### Issue: CORS errors
```javascript
// Add origin to CORS
app.use(cors({
  origin: ["https://frontend.com", "https://www.frontend.com"],
  credentials: true
}));
```

### Issue: Socket.io connection fails
```javascript
// Enable Socket.io CORS
io.engine.cors = {
  origin: "https://frontend.com",
  methods: ["GET", "POST"],
  credentials: true
};
```

### Issue: JWT token not working
```bash
# Regenerate JWT secret (minimum 32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 14. Rollback Procedure

### Heroku:
```bash
heroku releases
heroku rollback v123
```

### Git:
```bash
git log --oneline
git revert <commit-hash>
git push
```

---

## Deployment Summary

| Service | Frontend | Backend | Database |
|---------|----------|---------|----------|
| **Vercel** | ✅ | ❌ | ❌ |
| **Heroku** | ❌ | ✅ | ❌ |
| **Netlify** | ✅ | ❌ | ❌ |
| **Render** | ❌ | ✅ | ❌ |
| **MongoDB Atlas** | ❌ | ❌ | ✅ |

**Recommended Combo:**
- Frontend: **Vercel** (best for React)
- Backend: **Render** or **Heroku** (free tier available)
- Database: **MongoDB Atlas** (free tier)

---

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Socket.io Deployment](https://socket.io/docs/v4/server-installation/)
