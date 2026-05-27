# Professional Blocking System Documentation

## Overview
The professional blocking system allows admins to temporarily or permanently block professionals from the platform. Blocked professionals cannot accept new bookings and are removed from search results.

---

## Features

✅ **Temporary Blocking** - Block for N days (default 3)  
✅ **Auto-Unblocking** - Automatically restores access after block period expires  
✅ **Notifications** - Professional receives notifications about block status  
✅ **Status Management** - Blocks force professional status to "Offline"  
✅ **Manual Override** - Admin can manually unblock anytime  

---

## API Endpoints

### 1. Block a Professional

**Endpoint:** `PATCH /api/admin/professionals/:id/block`

**Required Headers:**
```json
{
  "Authorization": "Bearer [ADMIN_TOKEN]",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "days": 3
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Professional blocked until 5/26/2026",
  "data": {
    "_id": "professional_id",
    "firstName": "John",
    "lastName": "Doe",
    "isBlocked": true,
    "blockedUntil": "2026-05-26T00:00:00.000Z",
    "liveStatus": "Offline"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Professional not found"
}
```

---

### 2. Unblock a Professional

**Endpoint:** `PATCH /api/admin/professionals/:id/unblock`

**Required Headers:**
```json
{
  "Authorization": "Bearer [ADMIN_TOKEN]"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Professional unblocked successfully",
  "data": {
    "_id": "professional_id",
    "firstName": "John",
    "lastName": "Doe",
    "isBlocked": false,
    "blockedUntil": null,
    "liveStatus": "Free"
  }
}
```

---

### 3. Check & Auto-Unblock Expired Blocks

**Endpoint:** `POST /api/admin/check-and-auto-unblock`

**Required Headers:**
```json
{
  "Authorization": "Bearer [ADMIN_TOKEN]"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-unblocked 2 professional(s)",
  "data": {
    "success": true,
    "unblocked": 2
  }
}
```

---

## Implementation Details

### Database Schema (Professional Model)

```javascript
{
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedUntil: {
    type: Date,
    default: null
  },
  liveStatus: {
    type: String,
    enum: ['Free', 'Ongoing', 'Offline'],
    default: 'Free'
  }
}
```

### Automatic Unblocking Process

1. **Scheduled Check**: Runs every 1 hour on server startup
2. **Query**: Finds all professionals where:
   - `isBlocked === true`
   - `blockedUntil < current_time`
3. **Update**: Sets them to:
   - `isBlocked = false`
   - `blockedUntil = null`
   - `liveStatus = "Free"`
4. **Notification**: Each professional receives a notification about restoration

### Blocking Workflow

```
Admin initiates block
        ↓
Professional fields updated (isBlocked=true, blockedUntil=Date)
        ↓
Professional status set to "Offline"
        ↓
Professional receives warning notification
        ↓
---- WAIT FOR BLOCK PERIOD ----
        ↓
Auto-check every 1 hour detects expired block
        ↓
Professional automatically unblocked
        ↓
Professional receives restoration notification
        ↓
Professional can resume accepting bookings
```

---

## Professional Notifications

### Block Notification
```json
{
  "userId": "professional_user_id",
  "type": "warning",
  "title": "Account Suspended",
  "description": "Your professional account has been suspended for 3 days due to reported behavior. You will be able to resume services after 5/26/2026."
}
```

### Unblock Notification
```json
{
  "userId": "professional_user_id",
  "type": "success",
  "title": "Account Access Restored",
  "description": "Your professional account block period has expired. Your account has been automatically restored."
}
```

---

## Usage Examples

### cURL Examples

**Block Professional for 5 days:**
```bash
curl -X PATCH http://localhost:5000/api/admin/professionals/507f1f77bcf86cd799439011/block \
  -H "Authorization: Bearer your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{"days": 5}'
```

**Unblock Professional:**
```bash
curl -X PATCH http://localhost:5000/api/admin/professionals/507f1f77bcf86cd799439011/unblock \
  -H "Authorization: Bearer your_admin_token"
```

**Manual Check for Expired Blocks:**
```bash
curl -X POST http://localhost:5000/api/admin/check-and-auto-unblock \
  -H "Authorization: Bearer your_admin_token"
```

### JavaScript/Fetch Examples

**Block Professional:**
```javascript
const blockProfessional = async (professionalId, days = 3) => {
  const response = await fetch(
    `/api/admin/professionals/${professionalId}/block`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ days })
    }
  );
  return response.json();
};
```

**Unblock Professional:**
```javascript
const unblockProfessional = async (professionalId) => {
  const response = await fetch(
    `/api/admin/professionals/${professionalId}/unblock`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );
  return response.json();
};
```

---

## Restrictions for Blocked Professionals

When `isBlocked === true`:
- ❌ Cannot accept new bookings
- ❌ Not visible in search results
- ❌ Cannot communicate with users
- ❌ Status forced to "Offline"
- ✅ Can view existing bookings (read-only)
- ✅ Receive notifications about block status

---

## Admin Best Practices

1. **Always provide reasoning** - Document why a professional was blocked
2. **Use appropriate duration** - 
   - Minor issues: 1-3 days
   - Serious violations: 7-30 days
3. **Communicate clearly** - Notification explains suspension duration
4. **Review before blocking** - Check reports and user complaints first
5. **Monitor auto-unblocking** - Check logs for successful auto-unblocking

---

## Testing the System

### Manual Test Scenario

1. **Block a professional:**
   ```bash
   PATCH /api/admin/professionals/[ID]/block
   Body: {"days": 1}
   ```

2. **Verify blocked:**
   - Check database: `isBlocked === true`
   - Check professional status: `liveStatus === "Offline"`
   - Professional cannot appear in searches

3. **Wait for auto-unblock:**
   - After 1+ minute, run manual check:
   ```bash
   POST /api/admin/check-and-auto-unblock
   ```
   - Or wait up to 1 hour for automatic check

4. **Verify unblocked:**
   - Check database: `isBlocked === false`, `blockedUntil === null`
   - Professional status: `liveStatus === "Free"`
   - Professional can accept bookings again

---

## Troubleshooting

### Issue: Professional still blocked after block period

**Solution:** 
- Manual run the auto-unblock endpoint:
```bash
POST /api/admin/check-and-auto-unblock
```
- Check server logs for errors
- Verify `blockedUntil` date is in the past

### Issue: Professional not receiving notifications

**Solution:**
- Verify `userId` exists in professional record
- Check notification service is running
- Check user has subscribed to notifications

### Issue: Cannot block professional

**Solution:**
- Verify admin token is valid
- Check admin role is "admin"
- Verify professional ID is correct (24-char MongoDB ObjectId)
- Check error message in response

---

## Server Logs

The system logs auto-unblocking activities:

```
🔄 Checking for expired professional blocks...
✅ Auto-unblocked 2 professional(s)
```

Check logs to verify the system is working correctly.

---

## Future Enhancements

- [ ] Block history/audit log
- [ ] Reason field for blocking
- [ ] Appeal mechanism for blocked professionals
- [ ] Temporary vs permanent blocking distinction
- [ ] Integration with report system
- [ ] Admin dashboard widget showing blocked professionals
