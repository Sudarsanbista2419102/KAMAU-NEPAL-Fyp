# Pre-Deployment Checklist - Kamau Nepal

**Status:** Ready for Production Deployment ✅

---

## 1. Code Quality Check

- [ ] No console.log statements left in production code (or wrapped in dev checks)
- [ ] No hardcoded URLs (all using environment variables)
- [ ] No hardcoded API keys or secrets
- [ ] All error handling in place
- [ ] No broken imports or missing dependencies

**Verify:**
```bash
# Check for hardcoded localhost
grep -r "localhost:5001" Frontend/src/
grep -r "localhost:3000" Backend/

# Should return nothing or only in .env files
```

---

## 2. Environment Variables

### Backend (.env)
- [ ] `MONGO_URI` - MongoDB connection string ✅
- [ ] `JWT_SECRET` - JWT secret key ✅
- [ ] `KHALTI_PUBLIC_KEY` - Khalti public key ✅
- [ ] `KHALTI_SECRET_KEY` - Khalti secret key ✅
- [ ] `ESEWA_MERCHANT_CODE` - eSewa merchant code ✅
- [ ] `ESEWA_SECRET_KEY` - eSewa secret key ✅
- [ ] `EMAIL_USER` - Email for notifications ✅
- [ ] `EMAIL_PASS` - Email password ✅
- [ ] `FRONTEND_URL` - Frontend production URL
- [ ] `BACKEND_BASE_URL` - Backend production URL
- [ ] `CLIENT_BASE_URL` - Client production URL
- [ ] `NODE_ENV=production`

### Frontend (.env.production)
- [ ] `REACT_APP_API_URL` - Backend production URL

---

## 3. Database

- [ ] MongoDB Atlas cluster is active
- [ ] Database backups are configured
- [ ] Connection string is correct
- [ ] All collections are created
- [ ] Indexes are created for performance

**Test:**
```bash
# Run test connection
node Backend/testMongo.js
```

---

## 4. Payment Gateways

### Khalti
- [ ] Merchant account created
- [ ] Public key correct
- [ ] Secret key correct
- [ ] Sandbox testing completed
- [ ] Production keys ready (if switching from sandbox)

### eSewa
- [ ] Merchant account created
- [ ] Merchant code correct
- [ ] Secret key correct
- [ ] Sandbox testing completed
- [ ] Production keys ready (if switching from sandbox)

---

## 5. File Uploads

- [ ] Upload directory exists on server
- [ ] Permissions are correct (755 for directories, 644 for files)
- [ ] Multer configuration is correct
- [ ] File size limits are set appropriately
- [ ] Virus scanning is configured (optional)

---

## 6. Security

- [ ] CORS is configured correctly
- [ ] HTTPS is enabled on production
- [ ] JWT tokens have expiration
- [ ] Password hashing is implemented
- [ ] Rate limiting is configured
- [ ] Input validation is in place
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection enabled

---

## 7. Performance

- [ ] Database indexes are created
- [ ] Images are optimized
- [ ] Caching is configured
- [ ] CDN is set up (optional)
- [ ] Minification is enabled
- [ ] Gzip compression is enabled

---

## 8. Monitoring & Logging

- [ ] Error logging is configured
- [ ] Performance monitoring is set up
- [ ] Uptime monitoring is configured
- [ ] Alert notifications are set up
- [ ] Log rotation is configured

---

## 9. Deployment Platforms

### Render (Backend)
- [ ] Account created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Build command configured
- [ ] Start command configured
- [ ] Auto-deploy on push enabled

### Vercel (Frontend)
- [ ] Account created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Build command configured
- [ ] Output directory set to `build`
- [ ] Auto-deploy on push enabled

---

## 10. Testing Before Deployment

### Backend Tests
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] Authentication works
- [ ] Payment initiation works
- [ ] File uploads work
- [ ] Email notifications work
- [ ] Error handling works

### Frontend Tests
- [ ] Page loads without errors
- [ ] Login/signup works
- [ ] Booking creation works
- [ ] Payment flow works
- [ ] File uploads work
- [ ] Messages send correctly
- [ ] Images display correctly
- [ ] Mobile responsive

### Integration Tests
- [ ] End-to-end booking flow
- [ ] Payment verification
- [ ] Notification delivery
- [ ] Email sending
- [ ] Location services

---

## 11. Final Checks

- [ ] All code committed to GitHub
- [ ] No uncommitted changes
- [ ] Latest version is on main branch
- [ ] Tags are created for releases
- [ ] Documentation is updated
- [ ] README is current
- [ ] API documentation is complete

---

## 12. Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production deployment"
git push origin main
```

### Step 2: Deploy Backend to Render
1. Go to Render dashboard
2. Select your backend service
3. Click "Manual Deploy"
4. Wait for deployment to complete
5. Test the API endpoint

### Step 3: Deploy Frontend to Vercel
1. Go to Vercel dashboard
2. Select your frontend project
3. Click "Redeploy"
4. Wait for deployment to complete
5. Test the website

### Step 4: Verify Deployment
- [ ] Backend API responds
- [ ] Frontend loads
- [ ] Login works
- [ ] Payment works
- [ ] All features work

---

## 13. Post-Deployment

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify all features work
- [ ] Test payment gateways
- [ ] Check email notifications
- [ ] Monitor database performance
- [ ] Set up automated backups
- [ ] Configure monitoring alerts

---

## 14. Rollback Plan

If something goes wrong:

1. **Render Backend:**
   - Go to Deployments
   - Select previous successful deployment
   - Click "Redeploy"

2. **Vercel Frontend:**
   - Go to Deployments
   - Select previous successful deployment
   - Click "Redeploy"

3. **Database:**
   - Restore from backup
   - Contact MongoDB support if needed

---

## 15. Important URLs

- **Backend:** https://kamau-backend.onrender.com
- **Frontend:** https://your-project.vercel.app
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com

---

## 16. Support Contacts

- **Render Support:** support@render.com
- **Vercel Support:** support@vercel.com
- **MongoDB Support:** support@mongodb.com
- **Khalti Support:** support@khalti.com
- **eSewa Support:** support@esewa.com.np

---

## 17. Maintenance Schedule

- **Daily:** Monitor error logs
- **Weekly:** Check performance metrics
- **Monthly:** Review security logs
- **Quarterly:** Update dependencies
- **Annually:** Security audit

---

**Ready to Deploy? ✅**

If all checkboxes are checked, you're ready to deploy!

**Last Updated:** June 1, 2026
**Status:** Production Ready
