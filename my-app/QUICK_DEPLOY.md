# Quick Deploy Reference

## 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

## 2️⃣ Render Backend (5 minutes)

**URL:** https://render.com

1. New Web Service
2. Select repository
3. Root Directory: `Backend`
4. Add all env vars from `.env.production`
5. Deploy
6. **Copy URL** → `https://kamau-backend.onrender.com`

## 3️⃣ Vercel Frontend (3 minutes)

**URL:** https://vercel.com

1. Add Project
2. Select repository
3. Root Directory: `Frontend`
4. Add env var: `REACT_APP_API_URL=https://kamau-backend.onrender.com`
5. Deploy
6. **Copy URL** → `https://your-project.vercel.app`

## 4️⃣ Update Backend Env Vars

Go back to Render, update:
- `FRONTEND_URL=https://your-vercel-domain.vercel.app`
- `BACKEND_BASE_URL=https://kamau-backend.onrender.com`
- `CLIENT_BASE_URL=https://your-vercel-domain.vercel.app`

## 5️⃣ Test

- Visit frontend URL
- Login
- Send message
- Upload file
- Check console (F12)

---

## Environment Variables Needed

### Backend
```
PORT=5001
MONGO_URI=mongodb+srv://kamauapp:Dopeysaugat%407@finalyear.o7afbur.mongodb.net/kamau_nepal?appName=Finalyear
JWT_SECRET=secret123
EMAIL_USER=saugatbista456@gmail.com
EMAIL_PASS=lmdt lccz imbo jvhg
KHALTI_PUBLIC_KEY=53b0b7e759f34cb4a967d48b09f971a0
KHALTI_SECRET_KEY=56886fcbf1a640eea9c25d209a3acf68
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_BASE_URL=https://rc-epay.esewa.com.np
FRONTEND_URL=https://your-vercel-domain.vercel.app
BACKEND_BASE_URL=https://kamau-backend.onrender.com
CLIENT_BASE_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### Frontend
```
REACT_APP_API_URL=https://kamau-backend.onrender.com
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not loading | Check REACT_APP_API_URL in Vercel |
| CORS error | Check FRONTEND_URL in Render |
| Backend not responding | Check Render logs |
| Blank page | Check Vercel logs & browser console |
| Login fails | Check MongoDB connection in Render |

---

## Useful Links

- Render: https://dashboard.render.com
- Vercel: https://vercel.com/dashboard
- MongoDB: https://cloud.mongodb.com

---

**Total time: ~15 minutes** ⏱️
