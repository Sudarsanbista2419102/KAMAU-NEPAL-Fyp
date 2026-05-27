# Payment 404 Error Diagnostics

## Problem
You're seeing: `HTTP Status 404 – Not Found - Apache Tomcat/10.1.35`

## Root Cause
The frontend cannot reach the backend payment endpoint `/api/payments/esewa/initiate` (or khalti/initiate).

---

## Quick Fix Checklist

### 1. Verify Backend is Running
```bash
# Check if port 5001 is listening
netstat -ano | findstr :5001

# Should see: LISTENING on 127.0.0.1:5001

# If not, start backend:
cd my-app/Backend
npm start
```

### 2. Clear Browser Cache
- **Chrome**: Press `Ctrl+Shift+Delete` → Clear browsing data → All time
- **Firefox**: `Ctrl+Shift+Delete` → Select time range → Clear now
- **Edge**: `Ctrl+Shift+Delete` → Clear browsing data

### 3. Hard Refresh Frontend
- `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- This forces reload of JavaScript code

### 4. Check Browser Console (DevTools)
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for error messages:
   - `Cannot connect to http://127.0.0.1:5001`
   - `404 Not Found`
   - Network errors

### 5. Check Network Tab
1. Open DevTools → **Network** tab
2. Click "Pay Now" button
3. Filter for "payments"
4. Look for the request:
   - `POST /api/payments/esewa/initiate`
   - Check response status (should be 200, not 404)
   - Check response body for error message

---

## Detailed Troubleshooting

### Problem A: Backend Not Running
**Symptoms:**
- Console shows: "Cannot connect to server"
- Network tab shows: Connection refused

**Solution:**
```bash
# Terminal 1: Start Backend
cd my-app/Backend
npm start

# Expected output:
# Server running on http://127.0.0.1:5001
# MongoDB connected
```

### Problem B: Payment Route Not Registered
**Symptoms:**
- Backend running but getting 404
- Backend logs don't show payment route

**Solution:**
1. Check `Backend/index.js` has:
```javascript
import paymentRoute from "./paymentRoute.js";
app.use("/api/payments", paymentRoute);
```

2. Verify `Backend/paymentRoute.js` exports routes:
```javascript
router.post("/esewa/initiate", ...)
router.post("/khalti/initiate", ...)
```

3. **Restart backend** after any file changes

### Problem C: API Endpoint Wrong
**Symptoms:**
- 404 even though backend is running
- Different URL in logs vs code

**Solution:**
Check `Frontend/src/Dashboardsection/PaymentPage.jsx`:
```javascript
const ESEWA_INIT_URL = `/api/payments/esewa/initiate`;
const KHALTI_INIT_URL = `/api/payments/khalti/initiate`;

// These should match backend routes exactly
```

### Problem D: Authentication Failed
**Symptoms:**
- Error: `401 Unauthorized`
- Backend logs show: "No token provided"

**Solution:**
1. Ensure you're logged in before payment
2. Check localStorage has token:
   - DevTools → Application → LocalStorage
   - Look for key: `token`
   - Should have a long JWT string

### Problem E: Proxy/CORS Issue
**Symptoms:**
- 404 from different port (8080, 8000, etc.)
- Tomcat error message

**Solution:**
1. Check `Frontend/package.json`:
```json
"proxy": "http://127.0.0.1:5001"
```

2. Check `Frontend/src/services/apiInstance.js`:
```javascript
// Should be empty string to use proxy
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
```

3. Hard refresh browser (`Ctrl+F5`)

---

## Complete Verification Steps

Follow these steps **in order**:

1. **Start Backend**
   ```bash
   cd my-app/Backend
   npm start
   # Wait for: "Server running on http://127.0.0.1:5001"
   ```

2. **Start Frontend** (in new terminal)
   ```bash
   cd my-app/Frontend
   npm start
   # Wait for: "webpack compiled successfully"
   ```

3. **Test Backend Directly**
   ```bash
   # In browser, visit:
   http://localhost:5001/
   # Should see: "Backend is running"
   ```

4. **Clear Browser Cache**
   - Press `Ctrl+Shift+Delete`
   - Clear all browsing data
   - Click "Clear data"

5. **Hard Refresh Frontend**
   - Press `Ctrl+F5`
   - Wait for page to fully load

6. **Test Payment Endpoint**
   - Open DevTools (F12)
   - Go to Console tab
   - Run:
   ```javascript
   fetch('/api/payments/esewa/initiate', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${localStorage.getItem('token')}`
     },
     body: JSON.stringify({bookingId: 'test-booking-id'})
   }).then(r => r.json()).then(d => console.log(d));
   ```

7. **Go to Payment Page**
   - Log in
   - Go to a booking
   - Click "Pay Now"
   - Check console for logs

---

## What to Look For in Logs

### Backend Logs (Terminal)
```
✅ "eSewa Initiation Request received for: {bookingId}"
✅ "MongoDB connected"
✅ "Server running on http://127.0.0.1:5001"

❌ "Cannot find module 'paymentRoute.js'"
❌ "EADDRINUSE: address already in use :::5001"
```

### Frontend Console (DevTools → Console)
```
✅ "📍 Calling endpoint: /api/payments/esewa/initiate"
✅ "✅ eSewa initiation response: {...}"
✅ "🚀 Escalating Mission to eSewa Sandbox..."

❌ "404 Not Found"
❌ "Cannot connect to server"
❌ "401 Unauthorized"
```

### Frontend Network (DevTools → Network)
```
✅ POST /api/payments/esewa/initiate → Status 200
✅ Response body: {"success": true, "payload": {...}}

❌ POST /api/payments/esewa/initiate → Status 404
❌ Response body: "Apache Tomcat 404"
```

---

## Common Error Messages & Meanings

| Error | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | Route doesn't exist | Restart backend, check routes |
| 401 Unauthorized | Not logged in | Log in first |
| Cannot connect | Backend not running | Start backend on 5001 |
| Network Error | Wrong URL/proxy | Check apiInstance.js |
| CORS error | Headers issue | Check index.js CORS config |
| Socket hang up | Backend crashed | Check backend logs |

---

## Port Reference

Your application uses:
- **3000**: React Frontend (http://localhost:3000)
- **5001**: Node.js Backend (http://localhost:5001)

If you see Tomcat 404, it's probably hitting:
- **8080**: Tomcat (wrong!)
- **8000**: Some other service (wrong!)

**Always check port 5001 is being used.**

---

## If Still Not Working

1. **Check backend logs carefully**
   ```bash
   npm run backend 2>&1 | grep -i "error\|warning\|payment"
   ```

2. **Verify database connection**
   ```bash
   # Should see: "MongoDB connected"
   ```

3. **Check auth middleware**
   ```bash
   npm run backend 2>&1 | grep -i "auth\|token"
   ```

4. **Kill and restart all processes**
   ```bash
   taskkill /F /IM node.exe
   # Wait 5 seconds
   npm start
   ```

---

## Final Checklist

Before payment test:
- [ ] Backend running on 5001
- [ ] Frontend running on 3000
- [ ] Logged in with valid token
- [ ] Browser cache cleared
- [ ] Page hard-refreshed
- [ ] DevTools console open
- [ ] Network tab filter set to "payments"
- [ ] Booking has valid cost

---

**Status**: Updated after API instance fix  
**Last Fix**: Changed apiInstance.js to use proxy instead of explicit URL
