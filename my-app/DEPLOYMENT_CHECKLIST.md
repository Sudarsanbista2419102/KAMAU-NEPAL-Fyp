# Deployment Checklist

## Pre-Deployment ✅

- [ ] All code committed to GitHub
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured
- [ ] Application tested locally
- [ ] No console errors in development

## Backend (Render) Deployment

### Setup
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create Web Service for Backend
- [ ] Set Root Directory to `Backend`

### Environment Variables
- [ ] PORT=5001
- [ ] MONGO_URI (MongoDB connection string)
- [ ] JWT_SECRET
- [ ] EMAIL_USER & EMAIL_PASS
- [ ] KHALTI_PUBLIC_KEY & KHALTI_SECRET_KEY
- [ ] ESEWA_MERCHANT_CODE & ESEWA_SECRET_KEY
- [ ] FRONTEND_URL (will update after Vercel deployment)
- [ ] BACKEND_BASE_URL (will update after Render deployment)
- [ ] CLIENT_BASE_URL (will update after Vercel deployment)
- [ ] NODE_ENV=production

### Verification
- [ ] Backend deployed successfully
- [ ] Copy backend URL: `https://kamau-backend.onrender.com`
- [ ] Test: `curl https://kamau-backend.onrender.com/`

## Frontend (Vercel) Deployment

### Setup
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set Root Directory to `Frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`

### Environment Variables
- [ ] REACT_APP_API_URL=https://kamau-backend.onrender.com

### Verification
- [ ] Frontend deployed successfully
- [ ] Copy frontend URL: `https://your-project.vercel.app`
- [ ] Test: Visit the URL in browser

## Post-Deployment Configuration

### Update Backend Environment Variables
- [ ] FRONTEND_URL=https://your-vercel-domain.vercel.app
- [ ] BACKEND_BASE_URL=https://kamau-backend.onrender.com
- [ ] CLIENT_BASE_URL=https://your-vercel-domain.vercel.app

### Update Frontend Environment Variables
- [ ] REACT_APP_API_URL=https://kamau-backend.onrender.com

## Testing

### Backend Tests
- [ ] API endpoint responds
- [ ] Database connection works
- [ ] CORS allows frontend requests
- [ ] File uploads work

### Frontend Tests
- [ ] Page loads without errors
- [ ] Can login/signup
- [ ] Can send messages
- [ ] Can upload files
- [ ] Images display correctly
- [ ] No console errors

### Integration Tests
- [ ] Login works end-to-end
- [ ] Message sending works
- [ ] File attachments work
- [ ] Image preview works
- [ ] Payment integration works (if applicable)

## Monitoring

- [ ] Set up error tracking (optional)
- [ ] Monitor Render logs regularly
- [ ] Monitor Vercel analytics
- [ ] Check for failed deployments

## Troubleshooting

If something doesn't work:

1. **Check Render Logs**
   - Dashboard → Service → Logs
   - Look for error messages

2. **Check Vercel Logs**
   - Dashboard → Deployments → Logs
   - Look for build errors

3. **Check Browser Console**
   - Press F12
   - Look for network errors

4. **Verify Environment Variables**
   - All variables set correctly
   - No typos in URLs

5. **Test Locally First**
   - Reproduce issue locally
   - Fix locally
   - Push to GitHub
   - Redeploy

## Important URLs

- **Backend:** https://kamau-backend.onrender.com
- **Frontend:** https://your-vercel-domain.vercel.app
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard

## Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Express.js: https://expressjs.com
- React: https://react.dev

---

**Status:** Ready for deployment! 🚀
