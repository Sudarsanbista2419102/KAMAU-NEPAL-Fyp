# Admin Dashboard Backend - API Documentation

## Overview
This backend provides endpoints for the admin dashboard to manage professional registrations, view analytics, and verify applications.

## Base URL
```
http://localhost:5000/api/admin
```

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics
**GET** `/api/admin/dashboard/stats`

Get quick stats for the dashboard (total applications, pending, approved, rejected).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalApplications": 150,
    "totalPending": 25,
    "totalApproved": 110,
    "totalRejected": 15
  }
}
```

---

### 2. Get Recent Applications
**GET** `/api/admin/dashboard/recent`

Get the 5 most recent applications.

**Query Parameters:**
- `limit` (number, default: 5)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "firstName": "Ram",
      "lastName": "Bahadur",
      "username": "ram_pro_2025",
      "email": "ram@example.com",
      "serviceCategory": "plumbing",
      "serviceArea": "thamel",
      "hourlyWage": 500,
      "profileImage": "./Backend/uploads/professionals/...",
      "verificationStatus": "pending",
      "createdAt": "2025-02-02T10:30:00Z"
    }
  ]
}
```

**Example:**
```
GET /api/admin/dashboard/recent?limit=10
```

---

### 3. Get Full Analytics Data
**GET** `/api/admin/dashboard/analytics`

Get comprehensive analytics including top categories, top areas, and averages.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProfessionals": 150,
    "verified": 110,
    "pending": 25,
    "rejected": 15,
    "averageHourlyWage": 550,
    "topCategories": [
      { "category": "plumbing", "count": 35 },
      { "category": "electrical", "count": 28 },
      { "category": "carpentry", "count": 22 }
    ],
    "topAreas": [
      { "area": "thamel", "count": 45 },
      { "area": "kathmandu-center", "count": 38 },
      { "area": "patan", "count": 25 }
    ]
  }
}
```

---

## Professional Management Endpoints

### 4. Get All Professionals (Admin View)
**GET** `/api/admin/professionals`

Get paginated list of all professionals with filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional: pending|verified|rejected)
- `serviceCategory` (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "firstName": "Ram",
      "lastName": "Bahadur",
      "email": "ram@example.com",
      "phone": "9801234567",
      "serviceCategory": "plumbing",
      "serviceArea": "thamel",
      "hourlyWage": 500,
      "verificationStatus": "pending",
      "verificationDocuments": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Example:**
```
GET /api/admin/professionals?page=1&limit=20&status=pending
```

---

### 5. Get Pending Applications
**GET** `/api/admin/professionals/pending`

Get only pending applications waiting for approval.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "firstName": "Ram",
      "verificationStatus": "pending",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 6. Get Application Details
**GET** `/api/admin/professionals/:id`

Get full details of a specific application including documents.

**Parameters:**
- `id` (string, MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Ram",
    "lastName": "Bahadur",
    "email": "ram@example.com",
    "phone": "9801234567",
    "serviceCategory": "plumbing",
    "serviceArea": "thamel",
    "hourlyWage": 500,
    "bio": "Expert plumber with 10 years experience",
    "profileImage": "./Backend/uploads/professionals/...",
    "verificationDocuments": [
      {
        "filename": "cert-123456.pdf",
        "originalName": "certificate.pdf",
        "size": 245000,
        "mimetype": "application/pdf"
      }
    ],
    "verificationStatus": "pending",
    "createdAt": "2025-02-02T10:30:00Z"
  }
}
```

---

### 7. Search Professionals
**GET** `/api/admin/professionals/search`

Advanced search with multiple filters.

**Query Parameters:**
- `search` (string, optional - searches name, email, username)
- `status` (string, optional)
- `category` (string, optional)
- `area` (string, optional)
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [...professionals matching search],
  "pagination": {...}
}
```

**Examples:**
```
GET /api/admin/professionals/search?search=ram&status=pending

GET /api/admin/professionals/search?category=plumbing&area=thamel&page=1

GET /api/admin/professionals/search?search=@ram_pro&limit=50
```

---

## Application Verification Endpoints

### 8. Approve Professional Application
**PATCH** `/api/admin/applications/:id/approve`

Approve a professional's registration.

**Parameters:**
- `id` (string, MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "message": "Professional approved successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Ram",
    "verificationStatus": "verified",
    "verificationDate": "2025-02-02T15:30:00Z"
  }
}
```

**Example cURL:**
```bash
curl -X PATCH http://localhost:5000/api/admin/applications/60d5ec49c1234567890abcde/approve
```

---

### 9. Reject Professional Application
**PATCH** `/api/admin/applications/:id/reject`

Reject a professional's registration with a reason.

**Parameters:**
- `id` (string, MongoDB ObjectId)

**Request Body (JSON):**
```json
{
  "rejectionReason": "Documents not clear. Please resubmit with clearer images."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Professional rejected successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Ram",
    "verificationStatus": "rejected",
    "rejectionReason": "Documents not clear. Please resubmit with clearer images.",
    "verificationDate": "2025-02-02T15:30:00Z"
  }
}
```

**Example cURL:**
```bash
curl -X PATCH http://localhost:5000/api/admin/applications/60d5ec49c1234567890abcde/reject \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Documents not clear"
  }'
```

---

## Analytics Endpoints

### 10. Get Category Distribution
**GET** `/api/admin/analytics/categories`

Get breakdown of verified professionals by service category.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "category": "plumbing", "count": 35 },
    { "category": "electrical", "count": 28 },
    { "category": "carpentry", "count": 22 },
    { "category": "painting", "count": 18 },
    { "category": "cleaning", "count": 7 }
  ]
}
```

---

### 11. Get Status Distribution
**GET** `/api/admin/analytics/status`

Get breakdown of applications by status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pending": 25,
    "verified": 110,
    "rejected": 15
  }
}
```

---

## Export Endpoints

### 12. Export Data
**GET** `/api/admin/export`

Export professional data in JSON or CSV format.

**Query Parameters:**
- `format` (string, default: 'json', options: 'json'|'csv')
- `status` (string, optional - filter by status)

**Response (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "firstName": "Ram",
      ...
    }
  ]
}
```

**Response (CSV):**
```
"First Name","Last Name","Email","Phone","Service","Area","Wage","Status","Created At"
"Ram","Bahadur","ram@example.com","9801234567","plumbing","thamel","500","verified","2/2/2025"
```

**Examples:**
```
GET /api/admin/export?format=json

GET /api/admin/export?format=csv&status=verified

GET /api/admin/export?format=csv
```

---

## Error Responses

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Missing required fields or invalid data |
| 404 | Not Found | Professional or application not found |
| 500 | Server Error | Internal server error |

---

## To Integrate These Routes

Add to your `Backend/index.js`:

```javascript
import adminRoute from './adminRoute.js';

app.use('/api/admin', adminRoute);
```

---

## Key Features

- **Dashboard Statistics**: Real-time stats on applications
- **Analytics**: Distribution by category, area, status
- **Search & Filter**: Advanced filtering capabilities
- **Bulk Export**: Export data in JSON or CSV
- **Verification**: Approve or reject applications with reasons
- **Pagination**: All list endpoints support pagination
- **Multiple Views**: All professionals, pending only, search results

---

## Query Examples

### Get all pending applications
```
GET /api/admin/professionals/pending?page=1&limit=10
```

### Get plumbers in Thamel
```
GET /api/admin/professionals/search?category=plumbing&area=thamel
```

### Search by name
```
GET /api/admin/professionals/search?search=ram
```

### Export verified professionals as CSV
```
GET /api/admin/export?format=csv&status=verified
```

### Get dashboard analytics
```
GET /api/admin/dashboard/analytics
```
