# Final Deployment Guide - Kamau Nepal

**Your project is ready for production deployment!** 🚀

---

## What's Been Prepared

✅ Backend configured for Render  
✅ Frontend configured for Vercel  
✅ Environment variables set up  
✅ Payment gateways integrated (Khalti & eSewa)  
✅ Database connected (MongoDB Atlas)  
✅ File uploads configured  
✅ Email notifications set up  
✅ All code committed to GitHub  

---

## Deployment in 5 Minutes

### 1. Verify Everything is Committed
```bash
cd d:\A\Final year Project\my-app
git status
# Should show "nothing to commit, working tree clean"
```

### 2. Deploy Backend to Render

**URL:** https://dashboard.render.com

1. Click "New +" → "Web Service"
2. Select your GitHub repository
3. Configure:
   - **Name:** kamau-backend
   - **Environment:** Node
   - **Build Command:** npm install
   - **Start Command:** npm start
   - **Root Directory:** Backend
4. Add Environment Variables (copy from `.env`):
   ```
   PORT=5001
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=secret123
   KHALTI_PUBLIC_KEY=...
   KHALTI_SECRET_KEY=...
   ESEWA_MERCHANT_CODE=EPAYTEST
   ESEWA_SECRET_KEY=...
   EMAIL_USER=...
   EMAIL_PASS=...
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   BACKEND_BASE_URL=https://kamau-backend.onrender.com
   CLIENT_BASE_URL=https://your-vercel-domain.vercel.app
   NODE_ENV=production
   ```
5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. **Copy your backend URL** (e.g., https://kamau-backend.onrender.com)

### 3. Deploy Frontend to Vercel

**URL:** https://vercel.com/dashboard

1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. Configure:
   - **Framework Preset:** React
   - **Root Directory:** Frontend
   - **Build Command:** npm run build
   - **Output Directory:** build
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://kamau-backend.onrender.com
   ```
5. Click "Deploy"
6. Wait 2-5 minutes for deployment
7. **Copy your frontend URL** (e.g., https://your-project.vercel.app)

### 4. Update Backend Environment Variables

Go back to Render and update:
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
BACKEND_BASE_URL=https://kamau-backend.onrender.com
CLIENT_BASE_URL=https://your-vercel-domain.vercel.app
```

### 5. Test Your Deployment

1. Visit your frontend URL
2. Test login/signup
3. Create a booking
4. Test Khalti payment
5. Test eSewa payment
6. Send a message
7. Upload a file
8. Check browser console (F12) for errors

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Render: Services spin down after 15 minutes of inactivity
- Vercel: Limited deployments per month
- Consider upgrading for production use

✅ **Best Practices:**
- Keep sensitive data in environment variables
- Use HTTPS everywhere
- Monitor logs regularly
- Test thoroughly before deploying
- Keep backups of your database

---

## Troubleshooting

### Backend not responding
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

### Payment not working
1. Verify Khalti/eSewa keys are correct
2. Check backend logs for payment errors
3. Ensure booking has valid amount

### File uploads not working
1. Verify uploads directory exists
2. Check file permissions
3. Verify multer configuration

---

## After Deployment

### Monitor Your Application
- Check Render logs daily
- Monitor Vercel analytics
- Set up error tracking
- Configure uptime monitoring

### Update Code
```bash
git add .
git commit -m "Your message"
git push origin main
```
Both Render and Vercel will auto-deploy on push.

### Backup Your Database
- Set up MongoDB Atlas backups
- Export data regularly
- Keep local backups

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Express.js:** https://expressjs.com
- **React:** https://react.dev

---

## Deployment Checklist

Before clicking deploy:

- [ ] All code committed to GitHub
- [ ] No console errors locally
- [ ] All environment variables set
- [ ] Database connection tested
- [ ] Payment gateways tested
- [ ] File uploads tested
- [ ] Email notifications tested

---

## You're Ready! 🚀

Your Kamau Nepal application is production-ready. Follow the 5-minute deployment steps above and you'll be live!

**Questions?** Check the detailed guides:
- `DEPLOYMENT_GUIDE.md` - Step-by-step instructions
- `DEPLOYMENT_CHECKLIST.md` - Verification checklist
- `PRE_DEPLOYMENT_CHECKLIST.md` - Final checks

**Good luck with your deployment!**

---

**Last Updated:** June 1, 2026  
**Status:** ✅ Production Ready
