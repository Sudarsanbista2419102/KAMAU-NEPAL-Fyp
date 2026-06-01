# Quick Reference - Frontend API Configuration

## 🎯 TL;DR

**Frontend**: Create React App (CRA)
**Environment Variable**: `REACT_APP_API_BASE_URL`
**Development**: `http://localhost:5001` (with proxy)
**Production**: `https://kamau-nepal-fyp.onrender.com` (full URL)

---

## 📁 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `.env` | Development config | ✅ Ready |
| `.env.production` | Production config | ✅ Updated |
| `src/authService.js` | Auth API calls | ✅ Fixed |
| `src/professionalService.js` | Professional API calls | ✅ Fixed |
| `src/bookingService.js` | Booking API calls | ✅ Fixed |
| `src/services/messageService.js` | Message API calls | ✅ Fixed |
| `src/services/notificationService.js` | Notification API calls | ✅ Fixed |
| `src/services/reviewService.js` | Review API calls | ✅ Fixed |
| `src/Dashboardsection/PaymentPage.jsx` | Payment URLs | ✅ Fixed |
| `src/services/apiInstance.js` | Axios config | ✅ Verified |

---

## 🔧 How API Calls Work

### Pattern Used Everywhere
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const API_URL = `${API_BASE_URL}/api/endpoint`;
```

### Development
- `REACT_APP_API_BASE_URL` = `http://localhost:5001`
- API call: `http://localhost:5001/api/users/login`
- Proxy in package.json handles routing

### Production
- `REACT_APP_API_BASE_URL` = `https://kamau-nepal-fyp.onrender.com`
- API call: `https://kamau-nepal-fyp.onrender.com/api/users/login`
- Full HTTPS URL used directly

---

## ✅ What Was Fixed

1. **authService.js** - Auth endpoints
2. **professionalService.js** - Professional endpoints
3. **bookingService.js** - Booking endpoints
4. **messageService.js** - Message endpoints
5. **notificationService.js** - Notification endpoints
6. **reviewService.js** - Review endpoints
7. **PaymentPage.jsx** - Payment URLs
8. **.env.production** - Added Google Client ID

---

## 🚀 Deployment

### Vercel
1. Push to GitHub
2. Vercel auto-deploys
3. Uses `.env.production`
4. Done!

### Backend (Render)
- Already configured
- CORS allows Vercel URL
- No changes needed

---

## 🧪 Quick Test

### Development
```bash
npm start
# Login should work with localhost:5001
```

### Production
1. Visit https://kamau-nepal-fyp.vercel.app/
2. Open DevTools → Network
3. Login
4. Verify API calls go to onrender.com

---

## 🔍 Verification

- [x] No hardcoded localhost
- [x] No hardcoded relative paths
- [x] All services use env var
- [x] .env.production correct
- [x] CORS configured
- [x] Ready to deploy

---

## 📞 URLs

- **Frontend**: https://kamau-nepal-fyp.vercel.app/
- **Backend**: https://kamau-nepal-fyp.onrender.com
- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com

---

## ⚡ Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check Backend CORS config |
| 404 error | Verify Backend is running |
| Blank page | Check Vercel build logs |
| API timeout | Check Backend health |

---

## 📚 Full Documentation

- `FRONTEND_API_AUDIT.md` - Complete audit report
- `FRONTEND_DEPLOYMENT_READY.md` - Deployment guide
- `DEPLOYMENT_CONFIG.md` - Configuration details

