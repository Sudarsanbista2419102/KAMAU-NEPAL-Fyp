# Deployment Guide: Vercel + Render

This guide will help you deploy your MERN application to production using Vercel (Frontend) and Render (Backend).

## Prerequisites

1. GitHub account (for version control)
2. Vercel account (https://vercel.com)
3. Render account (https://render.com)
4. Git installed locally

---

## Part 1: Prepare Your Project

### 1.1 Push to GitHub

```bash
cd d:\A\Final year Project\my-app
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

If you haven't set up GitHub yet:
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/kamau-nepal.git
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend to Render

### 2.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository: `kamau-nepal`
4. Configure:
   - **Name:** `kamau-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `Backend`

### 2.3 Add Environment Variables
In Render dashboard, go to your service → Environment:

```
PORT=5001
MONGO_URI=mongodb+srv://kamauapp:Dopeysaugat%407@finalyear.o7afbur.mongodb.net/kamau_nepal?appName=Finalyear
JWT_SECRET=secret123
EMAIL_USER=saugatbista456@gmail.com
EMAIL_PASS=lmdt lccz imbo jvhg
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
KHALTI_PUBLIC_KEY=53b0b7e759f34cb4a967d48b09f971a0
KHALTI_SECRET_KEY=56886fcbf1a640eea9c25d209a3acf68
FRONTEND_URL=https://your-vercel-domain.vercel.app
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_BASE_URL=https://rc-epay.esewa.com.np
BACKEND_BASE_URL=https://your-render-domain.onrender.com
CLIENT_BASE_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### 2.4 Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy your backend URL: `https://kamau-backend.onrender.com`

---

## Part 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Configure:
   - **Framework Preset:** React
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

### 3.3 Add Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:

```
REACT_APP_API_URL=https://kamau-backend.onrender.com
```

### 3.4 Deploy
- Click "Deploy"
- Wait for deployment (2-5 minutes)
- Your frontend URL: `https://your-project.vercel.app`

---

## Part 4: Update Configuration

### 4.1 Update Backend Environment Variables
Go back to Render dashboard and update:

```
FRONTEND_URL=https://your-vercel-domain.vercel.app
BACKEND_BASE_URL=https://kamau-backend.onrender.com
CLIENT_BASE_URL=https://your-vercel-domain.vercel.app
```

### 4.2 Update Frontend Environment Variables
Go back to Vercel dashboard and update:

```
REACT_APP_API_URL=https://kamau-backend.onrender.com
```

---

## Part 5: Update API URLs in Code

### 5.1 Update message.jsx
Replace hardcoded localhost with environment variable:

**File:** `Frontend/src/Dashboardsection/message.jsx`

Change:
```javascript
const apiBaseUrl = 'http://localhost:5001';
```

To:
```javascript
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
```

### 5.2 Update ProfessionalMessages.jsx
**File:** `Frontend/src/serviceprovider/components/ProfessionalMessages.jsx`

Change:
```javascript
const apiBaseUrl = 'http://localhost:5001';
```

To:
```javascript
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
```

### 5.3 Update axios baseURL (if applicable)
Check if you have a global axios config and update it to use the environment variable.

---

## Part 6: Testing

### 6.1 Test Backend
```
curl https://kamau-backend.onrender.com/
```
Should return: "Backend is running"

### 6.2 Test Frontend
Visit: `https://your-vercel-domain.vercel.app`

### 6.3 Test API Calls
- Try logging in
- Upload a file
- Send a message with attachment
- Check browser console for any errors

---

## Part 7: Troubleshooting

### Backend not connecting
1. Check Render logs: Dashboard → Service → Logs
2. Verify environment variables are set
3. Check MongoDB connection string

### Frontend showing blank page
1. Check Vercel logs: Dashboard → Deployments → Logs
2. Check browser console (F12)
3. Verify REACT_APP_API_URL is set

### CORS errors
1. Verify FRONTEND_URL in backend environment variables
2. Check CORS configuration in Backend/index.js
3. Ensure both URLs are correct

### File uploads not working
1. Verify uploads directory exists on Render
2. Check file permissions
3. Verify multer configuration

---

## Part 8: Monitoring & Maintenance

### Monitor Backend
- Render Dashboard → Logs
- Check for errors regularly

### Monitor Frontend
- Vercel Dashboard → Analytics
- Check for build failures

### Update Code
```bash
git add .
git commit -m "Your message"
git push origin main
```
Both Vercel and Render will auto-deploy on push.

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Render: Services spin down after 15 minutes of inactivity
- Vercel: Limited to 100 deployments/month
- Consider upgrading for production use

✅ **Best Practices:**
- Keep sensitive data in environment variables
- Use HTTPS everywhere
- Monitor logs regularly
- Test thoroughly before deploying
- Keep backups of your database

---

## Support

If you encounter issues:
1. Check the logs on Render/Vercel
2. Verify environment variables
3. Test locally first
4. Check GitHub issues for similar problems

Good luck with your deployment! 🚀
