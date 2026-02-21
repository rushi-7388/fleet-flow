# 🚀 Quick Vercel Deployment (10 minutes)

## Backend → Railway | Frontend → Vercel

### 1️⃣ Backend (Railway)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Go to railway.app → New Project → Deploy from GitHub
# 3. Add PostgreSQL database in Railway
# 4. Set environment variables:
PORT=4000
DATABASE_URL=<from Railway PostgreSQL>
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production

# 5. After deployment, run migrations:
railway run npx prisma migrate deploy
railway run npm run prisma:seed
```

**Copy your Railway URL**: `https://your-app.railway.app`

---

### 2️⃣ Frontend (Vercel)

```bash
# 1. Go to vercel.com → Add New Project → Import GitHub repo
# 2. Configure:
#    - Root Directory: frontend
#    - Framework: Next.js (auto)
# 3. Add environment variable:
NEXT_PUBLIC_API_URL=https://your-app.railway.app/api

# 4. Deploy!
```

**Your app**: `https://your-app.vercel.app`

---

## ✅ Done!

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Login: `admin@fleetflow.com` / `admin123`

See `VERCEL_DEPLOY.md` for detailed troubleshooting.
