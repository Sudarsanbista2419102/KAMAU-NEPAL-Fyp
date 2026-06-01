# eSewa Integration Troubleshooting Guide

## Common Problems & Solutions

### 🔴 Problem 1: "Cannot connect to server" when clicking eSewa button

**Symptoms:**
- Error: "eSewa Initiation refused"
- Frontend shows error after clicking Pay button

**Causes:**
1. Backend not running on port 5001
2. Payment route not registered in index.js
3. CORS configuration blocking request

**Solutions:**

**A. Check Backend Status**
```bash
# In Terminal, check if port 5001 is listening
netstat -ano | findstr :5001

# If not running, start backend
cd my-app/Backend
npm start
```

**B. Verify Route Registration**
Open `Backend/index.js` and confirm:
```javascript
import paymentRoute from "./paymentRoute.js";
app.use("/api/payments", paymentRoute);
```

**C. Check CORS Configuration**
In `Backend/index.js`, verify CORS includes your frontend:
```javascript
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
```

---

### 🔴 Problem 2: "Signature Mismatch" or verification fails

**Symptoms:**
- Backend logs show: "⚠️ eSewa Signature Mismatch"
- Payment shows as failed
- Error: "Verification_failed"

**Causes:**
1. Wrong `ESEWA_SECRET_KEY` in .env
2. Signature format incorrect
3. Secret key has extra spaces

**Solutions:**

**A. Verify Secret Key Format**
```bash
# In .env, check ESEWA_SECRET_KEY
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q

# NO spaces before or after
# Copy exactly from eSewa documentation
```

**B. Check Base64 Encoding**
Backend logs should show proper Base64 signature. If not, regenerate with:
```javascript
// This is automatically done, but verify in logs
const signature = crypto
  .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
  .update(signature_message)
  .digest("base64");
```

**C. Restart Backend After Changing .env**
```bash
# Kill current process
pkill -f "node index.js"

# Start fresh
npm start
```

---

### 🔴 Problem 3: Backend redirects to wrong success/failure URL

**Symptoms:**
- After payment, redirected to wrong page
- Shows 404 or blank page
- URL doesn't match expected format

**Causes:**
1. `CLIENT_BASE_URL` incorrect in .env
2. `BACKEND_BASE_URL` incorrect in .env
3. Frontend not handling redirect correctly

**Solutions:**

**A. Verify URLs in .env**
```bash
# Should match your actual URLs
BACKEND_BASE_URL=http://localhost:5001
CLIENT_BASE_URL=http://localhost:3000

# For production, use domain names
BACKEND_BASE_URL=https://api.yourdomain.com
CLIENT_BASE_URL=https://yourdomain.com
```

**B. Check Redirect Handler**
In `Frontend/src/Dashboardsection/KhaltiVerify.jsx`:
```javascript
// Should handle eSewa status correctly
const esewaStatus = searchParams.get('status');
if (esewaStatus === 'success') {
  // Handle success
}
```

---

### 🔴 Problem 4: eSewa Status Lookup API unreachable

**Symptoms:**
- Logs show: "❌ eSewa Status Lookup API unreachable"
- Payment verification fails
- Even successful payments marked as failed

**Causes:**
1. Wrong `ESEWA_BASE_URL`
2. Network connectivity issue
3. Typo in API endpoint

**Solutions:**

**A. Verify eSewa URL**
```bash
# Check .env
ESEWA_BASE_URL=https://rc-epay.esewa.com.np

# For production:
ESEWA_BASE_URL=https://epay.esewa.com.np
```

**B. Test API Connectivity**
```bash
# From Terminal, test if eSewa API is reachable
curl https://rc-epay.esewa.com.np/api/epay/transaction/status/ \
  -G \
  -d "product_code=EPAYTEST" \
  -d "total_amount=100" \
  -d "transaction_uuid=test-123"
```

**C. Check Network/Firewall**
- Ensure outbound HTTPS is allowed
- Disable VPN if using one
- Try from different network

---

### 🔴 Problem 5: Payment not saved to database

**Symptoms:**
- Frontend shows success
- But booking payment status remains "Pending"
- No transaction ID saved

**Causes:**
1. Booking ID not found in database
2. Database connection error
3. Payment record update failed

**Solutions:**

**A. Verify Booking Exists**
```bash
# In MongoDB shell
db.bookings.findById(ObjectId("YOUR_BOOKING_ID"))

# Should return booking document
```

**B. Check Transaction UUID Format**
Backend extracts booking ID from UUID:
```javascript
const bookingId = transaction_uuid.split("-")[0];
// UUID format: {bookingId}-{timestamp}
// Example: 6a1234567890abcd-1234567890123
```

**C. Check Booking Model**
In `Backend/models/bookingModel.js`, verify fields exist:
```javascript
paymentStatus: String,
paymentMethod: String,
transactionId: String,
paymentDetails: Object
```

**D. Manually Test Update**
```bash
# In backend console logs, verify update succeeds
# Look for: "Booking payment status updated"
# or "Payment details saved"
```

---

### 🟡 Problem 6: eSewa Form not submitting

**Symptoms:**
- Form created but doesn't POST to eSewa
- Page hangs or redirects to blank page
- No eSewa payment page loads

**Causes:**
1. Form URL incorrect
2. Hidden form inputs missing
3. JavaScript error preventing submission

**Solutions:**

**A. Verify eSewa Form URL**
In `Frontend/src/Dashboardsection/PaymentPage.jsx`:
```javascript
const ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

// For production:
// const ESEWA_FORM_URL = "https://epay.esewa.com.np/api/epay/main/v2/form";
```

**B. Check Form Payload**
Backend should return all required fields:
- `amount`
- `tax_amount`
- `total_amount`
- `transaction_uuid`
- `product_code`
- `success_url`
- `failure_url`
- `signature`
- `signed_field_names`

**C. Debug Frontend**
Open browser DevTools → Network tab:
1. Filter for "form" or "esewa"
2. Should see POST to eSewa URL
3. Check payload contains all fields

---

### 🟡 Problem 7: Wrong error message shown to user

**Symptoms:**
- Generic error message instead of specific reason
- "Neural Hub: eSewa Initiation refused" shows for all errors

**Causes:**
1. Error details not propagated
2. Try-catch blocks too broad
3. API response format unexpected

**Solutions:**

**A. Check Backend Error Logs**
```bash
# Run backend with more verbose logging
DEBUG=* npm run backend

# Look for detailed error messages
```

**B. Add Custom Error Handler**
In backend, add more specific error messages:
```javascript
if (!response.data.success) {
  throw new Error(`eSewa API Error: ${response.data.message}`);
}
```

**C. Frontend Error Display**
Improve error message in `PaymentPage.jsx`:
```javascript
const msg = err.response?.data?.message || err.message || 'eSewa error';
setError(`eSewa: ${msg}`);
```

---

## 🔧 Debug Checklist

Run through this in order if payment fails:

```bash
□ Backend running on port 5001?
  → curl http://localhost:3000/

□ Can connect to backend from frontend?
  → Check browser DevTools Network tab

□ Payment route registered?
  → Check index.js imports paymentRoute

□ .env file has correct eSewa credentials?
  → cat .env | grep ESEWA

□ Booking exists in database?
  → Check MongoDB bookings collection

□ eSewa API reachable?
  → curl to eSewa endpoints

□ Form submitting to correct URL?
  → Check browser DevTools Network tab

□ Response contains all required fields?
  → Log response.data.payload in browser

□ Signature generated correctly?
  → Check backend logs for signature
```

---

## 📊 Monitoring & Logs

**Watch backend logs for eSewa activity:**
```bash
npm run backend 2>&1 | grep -E "eSewa|esewa|Payment"

# Look for these indicators:
✅ "eSewa Initiation Request received"
✅ "📥 eSewa Response Pulse"
✅ "🔍 eSewa Status Lookup Result: COMPLETE"
❌ "eSewa Signature Mismatch"
❌ "eSewa Status Lookup API unreachable"
```

**Frontend console logs:**
```javascript
// Open DevTools → Console
// Look for eSewa payment flow messages
```

---

## 🚀 Quick Fix Procedures

### If payment stuck after redirecting from eSewa:
```bash
1. Check backend logs for verification errors
2. Manual verify in MongoDB:
   db.bookings.findOne({transactionId: "uuid"})
3. If verified but not saved:
   db.bookings.updateOne({_id: ObjectId("id")}, 
     {$set: {paymentStatus: "Paid", paymentMethod: "eSewa"}})
4. Reload frontend page
```

### If form doesn't submit to eSewa:
```bash
1. Open DevTools → Console
2. Manually trigger: document.querySelector('form').submit()
3. Check if POST request appears in Network tab
4. If not, check for JavaScript errors
```

### If signature verification fails:
```bash
1. Copy exact secret key from eSewa
2. Paste into .env without extra spaces
3. Restart backend: npm run backend
4. Try payment again
5. Check logs for new signature
```

---

## 🔒 Security Considerations

**Never share or log:**
- `ESEWA_SECRET_KEY`
- Full transaction UUIDs in errors
- Customer payment information
- Full backend URLs in frontend code

**Always verify:**
- Signature on both request and response
- eSewa Status Lookup API response
- Booking exists before updating
- User authentication before initiating

---

## 📞 When to Escalate

Contact eSewa support if:
- Status Lookup API continuously unreachable
- Signature verification fails despite correct key
- eSewa form URL not accepting POSTs
- Gateway redirects to wrong page consistently

**eSewa Support:**
- Website: www.esewa.com.np
- Documentation: developer.esewa.com.np (or equivalent)
- Test credentials available in sandbox

---

## ✅ Verification After Fix

After applying a fix:
1. ✅ Test complete payment flow
2. ✅ Check database for saved transaction
3. ✅ Verify notification sent to professional
4. ✅ Check frontend success message displays
5. ✅ Monitor logs for any warnings

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Ready for Troubleshooting
