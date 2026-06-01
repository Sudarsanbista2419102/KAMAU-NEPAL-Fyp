# Admin Authentication - API Documentation

## Overview
This backend provides JWT-based authentication for admin users with role-based access control and permissions.

## Base URL
```
http://localhost:5000/api/auth
```

---

## Setup

### 1. Create Default Admin Account

Run the seeder script to create a default admin:

```bash
cd Backend
node seedAdmin.js
```

**Default Credentials:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the password immediately in production!

### 2. JWT Secret

Make sure to set `JWT_SECRET` in your `.env` file:

```env
JWT_SECRET=your-super-secret-key-here
```

---

## Authentication Endpoints

### 1. Admin Login
**POST** `/api/auth/admin/login`

Authenticate admin user and get JWT token.

**Request (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Or use email instead of username:
```json
{
  "username": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "60d5ec49c1234567890abcde",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "System Administrator",
    "role": "super_admin",
    "permissions": [
      "view_dashboard",
      "manage_professionals",
      "verify_applications",
      "reject_applications",
      "view_analytics",
      "export_data",
      "manage_admins"
    ]
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

### 2. Verify Token
**POST** `/api/auth/admin/verify`

Verify if a JWT token is still valid.

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": "60d5ec49c1234567890abcde",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "System Administrator",
    "role": "super_admin",
    "permissions": [...]
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Token expired"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Admin Logout
**POST** `/api/auth/admin/logout`

Logout admin user (mainly for client-side cleanup).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Protected Routes

All protected routes require the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 4. Get Admin Profile
**GET** `/api/auth/admin/profile`

Get current logged-in admin's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "System Administrator",
    "role": "super_admin",
    "permissions": [...],
    "isActive": true,
    "lastLogin": "2025-02-02T15:30:00Z",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/admin/profile \
  -H "Authorization: Bearer <token>"
```

---

### 5. Update Admin Profile
**PUT** `/api/auth/admin/profile`

Update admin's profile information.

**Request (JSON):**
```json
{
  "fullName": "John Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "fullName": "John Doe",
    ...
  }
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:5000/api/auth/admin/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe"
  }'
```

---

### 6. Change Password
**POST** `/api/auth/admin/change-password`

Change admin password.

**Request (JSON):**
```json
{
  "oldPassword": "admin123",
  "newPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Old password is incorrect"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "admin123",
    "newPassword": "newPassword456"
  }'
```

---

## Admin Model

### Admin Schema

```javascript
{
  username: String (unique, lowercase),
  email: String (unique, lowercase),
  password: String (hashed, never returned),
  fullName: String,
  role: String (enum: super_admin, admin, moderator),
  permissions: [String],
  isActive: Boolean,
  lastLogin: Date,
  loginHistory: [{
    loginTime: Date,
    ipAddress: String,
    userAgent: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Roles

- **super_admin**: Full access to all features
- **admin**: Can manage most features
- **moderator**: Limited access (view-only)

### Available Permissions

- `view_dashboard`: View admin dashboard
- `manage_professionals`: View and manage professional profiles
- `verify_applications`: Approve professional applications
- `reject_applications`: Reject applications
- `view_analytics`: View analytics and reports
- `export_data`: Export data
- `manage_admins`: Create/modify admin accounts

---

## Middleware

### verifyAdminToken

Middleware to verify JWT token. Use it to protect routes:

```javascript
import { verifyAdminToken } from './adminAuthMiddleware.js';

router.get('/protected-route', verifyAdminToken, controllerFunction);
```

### checkAdminRole

Middleware to check if user has admin role:

```javascript
import { checkAdminRole } from './adminAuthMiddleware.js';

router.get('/admin-only', verifyAdminToken, checkAdminRole, controllerFunction);
```

### checkPermission

Middleware to check specific permission:

```javascript
import { checkPermission } from './adminAuthMiddleware.js';

router.post('/verify-pro', 
  verifyAdminToken, 
  checkPermission('verify_applications'), 
  controllerFunction
);
```

---

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Permission-based authorization
- ✅ Login history tracking
- ✅ Token expiration (24 hours)
- ✅ Inactive admin blocking

---

## Usage Examples

### Frontend Login Example

```javascript
import * as adminAuthService from './adminAuthService';

const handleLogin = async (username, password) => {
  try {
    const response = await adminAuthService.adminLogin(username, password);
    if (response.success) {
      // Token automatically stored in localStorage
      console.log('Login successful');
      // Redirect to dashboard
      window.location.href = '/admin/dashboard';
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Protected Route Example

```javascript
import AdminPrivateRoute from './AdminPrivateRoute';
import AdminDashboard from './AdminDashboard';

<AdminPrivateRoute>
  <AdminDashboard />
</AdminPrivateRoute>
```

### API Call with Token

```javascript
import axios from 'axios';

const token = localStorage.getItem('adminToken');

const response = await axios.get(
  'http://localhost:5000/api/admin/dashboard/stats',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid credentials or no token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Admin not found |
| 500 | Server Error | Internal server error |

---

## Token Storage

Tokens are automatically stored in localStorage:

```javascript
localStorage.getItem('adminToken')     // JWT token
localStorage.getItem('adminUser')      // Admin user data
```

## Auto-Logout

Implement auto-logout when token expires:

```javascript
useEffect(() => {
  const verifyToken = async () => {
    try {
      await adminAuthService.verifyAdminToken();
    } catch (error) {
      // Token expired - logout
      adminAuthService.adminLogout();
      navigate('/admin/login');
    }
  };

  const interval = setInterval(verifyToken, 5 * 60 * 1000); // Check every 5 min
  return () => clearInterval(interval);
}, []);
```
