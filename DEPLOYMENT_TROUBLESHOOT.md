# Deployed Frontend Not Getting Backend Data - Troubleshooting Guide

**Issue:** Frontend at https://kamau-nepal-fyp.vercel.app is not retrieving data from Backend at https://kamau-nepal-fyp.onrender.com

**Date:** June 2, 2026

---

## Step 1: Verify Backend is Running

### Check Backend Status
```bash
# Test basic connectivity
curl https://kamau-nepal-fyp.onrender.com/

# Expected response: "Backend is running"
```

### If Backend Not Responding:
1. Go to https://dashboard.render.com
2. Select **kamau-backend** service
3. Check **Deployments** tab for errors
4. Check **Logs** tab for MongoDB connection errors
5. If needed, click **Redeploy** button

---

## Step 2: Verify MongoDB Connection

### Check if MongoDB Connected
Visit backend logs and look for:
```
✅ MongoDB connected
Server running on port 5001
```

### If MongoDB Not Connecting:
1. Go to Render Dashboard → kamau-backend → Environment
2. Verify `MONGO_URI` is set correctly
3. Should be: `mongodb+srv://kamauapp:Dopeysaugat%407@finalyear.o7afbur.mongodb.net/kamau_nepal?appName=Finalyear`

---

## Step 3: Check API Endpoints

### Test Basic Endpoints
```bash
# Test authentication required endpoint
curl -H "Authorization: Bearer TOKEN" \
  https://kamau-nepal-fyp.onrender.com/api/admin/users

# Test public endpoint
curl https://kamau-nepal-fyp.onrender.com/api/categories
```

### Expected Responses:
- ✅ 200 OK with JSON data
- ❌ 401 Unauthorized (if token needed and not provided)
- ❌ 404 Not Found (endpoint doesn't exist)
- ❌ 500 Internal Server Error (backend crash)

---

## Step 4: Check CORS Configuration

### What Frontend Sees:
When calling API from Frontend, browser checks CORS headers.

### Backend CORS Configuration
File: `Backend/index.js`
```javascript
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3002", 
    "http://localhost:3003",
    process.env.FRONTEND_URL || "http://localhost:3000"
  ],
  credentials: true
}));
```

### Fix Required
The `FRONTEND_URL` environment variable in Render must match Frontend URL:
- **Should be:** `https://kamau-nepal-fyp.vercel.app`
- **Currently in .env.production:** `https://kamau-nepal-fyp.vercel.app` ✅

### To Verify CORS Is Working:
1. Open Frontend in browser
2. Press F12 (DevTools)
3. Go to Network tab
4. Make an API call
5. Check response headers for:
   ```
   Access-Control-Allow-Origin: https://kamau-nepal-fyp.vercel.app
   ```

---

## Step 5: Check Frontend API Configuration

### Frontend Files to Check:
1. `Frontend/.env.production`
   ```
   REACT_APP_API_BASE_URL=https://kamau-nepal-fyp.onrender.com
   ```

2. `Frontend/src/services/apiInstance.js`
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kamau-nepal-fyp.onrender.com';
   ```

### Check if Using Correct Base URL
- ✅ Should use: `https://kamau-nepal-fyp.onrender.com/api/...`
- ❌ Should NOT use: `http://localhost:5001/api/...`
- ❌ Should NOT use: relative paths like `/api/...`

---

## Step 6: Common Issues & Solutions

### Issue 1: Network Tab Shows 404
**Cause:** API endpoint doesn't exist  
**Solution:**
1. Check endpoint in Backend routes
2. Verify URL spelling matches
3. Example: `/api/categories` (not `/api/category`)

### Issue 2: Network Tab Shows CORS Error
**Cause:** Frontend URL not in CORS whitelist  
**Solution:**
1. Go to Render Dashboard
2. Set `FRONTEND_URL=https://kamau-nepal-fyp.vercel.app`
3. Redeploy backend
4. Clear browser cache

### Issue 3: Network Tab Shows 401 Unauthorized
**Cause:** Missing or invalid authentication token  
**Solution:**
1. Check localStorage for `token` or `adminToken`
2. Verify token is being sent in Authorization header
3. Log in again to get fresh token

### Issue 4: Network Tab Shows 500 Error
**Cause:** Backend crashed or threw error  
**Solution:**
1. Check Render backend logs
2. Look for MongoDB connection errors
3. Look for validation errors
4. Redeploy or restart backend

### Issue 5: No Network Request Shown
**Cause:** Frontend never tried to call API  
**Solution:**
1. Check browser console for JavaScript errors
2. Verify function is being called
3. Check if conditions prevent API call

---

## Step 7: Diagnostic Checklist

### Backend (Render) Checklist:
- [ ] Backend is running (no "Build failed" errors)
- [ ] MongoDB is connected (check logs)
- [ ] All environment variables set:
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL=https://kamau-nepal-fyp.vercel.app`
  - [ ] `NODE_ENV=production`
- [ ] CORS whitelist includes Frontend URL
- [ ] API endpoints responding (test with curl)

### Frontend (Vercel) Checklist:
- [ ] Build succeeded (no build errors)
- [ ] Environment variables set:
  - [ ] `REACT_APP_API_BASE_URL=https://kamau-nepal-fyp.onrender.com`
- [ ] apiInstance uses correct base URL
- [ ] Bearer token included in headers
- [ ] No hardcoded localhost URLs

### Network Checklist:
- [ ] Frontend can reach backend (test with curl)
- [ ] CORS headers present in response
- [ ] No 404 errors for endpoints
- [ ] No 401 without token
- [ ] No 500 errors

---

## Step 8: Testing Procedure

### 1. Direct Backend Test
```bash
# Replace with actual values
curl -X GET https://kamau-nepal-fyp.onrender.com/

# Expected: "Backend is running"
```

### 2. Test API Endpoint
```bash
curl -X GET https://kamau-nepal-fyp.onrender.com/api/categories

# Expected: JSON array of categories
```

### 3. Test with Authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://kamau-nepal-fyp.onrender.com/api/admin/users

# Expected: JSON array of users
```

### 4. Test from Frontend Console
Open browser DevTools on Frontend and run:
```javascript
// Check API base URL
console.log(process.env.REACT_APP_API_BASE_URL);

// Try fetching data
fetch('https://kamau-nepal-fyp.onrender.com/api/categories')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

---

## Step 9: Deployment Status Check

### Backend Render Deployment:
1. Go to https://dashboard.render.com
2. Click **kamau-backend** service
3. Check:
   - [ ] Service status: **Running** (green)
   - [ ] Latest deployment: **Succeeded**
   - [ ] Logs show: "MongoDB connected"
   - [ ] No errors in recent logs

### Frontend Vercel Deployment:
1. Go to https://vercel.com/dashboard
2. Click your project
3. Check:
   - [ ] Latest deployment: **Ready** (green)
   - [ ] Build log: **No errors**
   - [ ] Environment variables: **Set**

---

## Step 10: If Still Not Working

### Enable Verbose Logging
1. Open browser DevTools (F12)
2. Network tab
3. Make an API call
4. Check every detail:
   - URL being called
   - Method (GET, POST, etc.)
   - Status code
   - Response headers
   - Response body

### Check Backend Logs
1. Render Dashboard → kamau-backend → Logs
2. Look for:
   - API request received
   - Error messages
   - MongoDB operations
   - CORS headers sent

### Manual Testing
Test each component separately:
1. Backend alone (curl)
2. Frontend alone (DevTools)
3. Network between them (ping, traceroute)
4. Authentication flow

---

## Environment Variables Required

### Render Backend (.env or environment)
```
MONGO_URI=mongodb+srv://kamauapp:Dopeysaugat%407@finalyear.o7afbur.mongodb.net/kamau_nepal?appName=Finalyear
JWT_SECRET=secret123
EMAIL_USER=saugatbista456@gmail.com
EMAIL_PASS=lmdt lccz imbo jvhg
FRONTEND_URL=https://kamau-nepal-fyp.vercel.app
BACKEND_BASE_URL=https://kamau-nepal-fyp.onrender.com
CLIENT_BASE_URL=https://kamau-nepal-fyp.vercel.app
NODE_ENV=production
PORT=5001
```

### Vercel Frontend (.env.production)
```
REACT_APP_API_BASE_URL=https://kamau-nepal-fyp.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=617010920902-tk5ihvga57fq13jqh4qo7k9fkppa9ng4.apps.googleusercontent.com
```

---

## Quick Fixes

### Fix 1: Redeploy Backend
```bash
# In Render Dashboard
1. Go to kamau-backend service
2. Click "Redeploy" button
3. Wait for deployment to complete
4. Check logs for "MongoDB connected"
```

### Fix 2: Clear Browser Cache
```bash
# In browser
1. Press F12 (DevTools)
2. Right-click refresh button
3. Click "Empty cache and hard refresh"
4. Or: Ctrl+Shift+Delete to clear cache
```

### Fix 3: Update Environment Variables
```bash
# In Render Dashboard
1. kamau-backend → Environment
2. Set/Update:
   - FRONTEND_URL=https://kamau-nepal-fyp.vercel.app
   - NODE_ENV=production
3. Click "Save" and "Redeploy"
```

### Fix 4: Verify API Calls
```javascript
// In browser console on Frontend
// Check if using correct base URL
const response = await fetch('https://kamau-nepal-fyp.onrender.com/api/categories');
const data = await response.json();
console.log(data);
```

---

## Success Indicators

✅ **Working:**
- Backend responds to GET /
- Backend responds to GET /api/categories
- Frontend can make API calls
- DevTools Network tab shows 200 status
- Data displays on page

---

## Still Stuck?

### Collect Information:
1. What error do you see in browser?
2. What status code in Network tab? (404? 500? CORS error?)
3. What endpoint is being called?
4. Is backend running? (Test with curl)
5. Are environment variables set?

### Next Steps:
1. Check Render backend logs for errors
2. Verify MongoDB connection in logs
3. Test with curl from command line
4. Check Frontend build in Vercel logs
5. Review all environment variables

---

**Created:** June 2, 2026  
**Status:** Troubleshooting Guide  
**Last Updated:** During MongoDB cleanup & booking fix

