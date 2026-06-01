# Professional Registration Backend - API Documentation

## Overview
This backend provides endpoints for managing professional service providers registration and verification system.

## Base URL
```
http://localhost:5000/api/professionals
```

## File Structure
```
Backend/
├── controllers/
│   └── professionalController.js    # Controller with all business logic
├── models/
│   └── professionalModel.js         # MongoDB schema for Professional
├── professionalRoute.js              # All routes defined here
└── uploads/
    └── professionals/                # Where uploaded files are stored
```

---

## Database Model (MongoDB)

### Professional Schema
```javascript
{
  firstName: String (required),
  lastName: String (required),
  username: String (required, unique),
  email: String (required, unique),
  phone: String (required, format: 10 digits),
  serviceCategory: String (enum: plumbing, electrical, carpentry, cleaning, painting, gardening, mechanic, tutoring),
  serviceArea: String (enum: thamel, kathmandu-center, patan, boudha, koteshwor, bhaktapur-center, nagarkot, changu, pulchowk, jawalakhel),
  hourlyWage: Number (required, min: 0),
  bio: String (max: 500 characters),
  profileImage: String (file path),
  verificationDocuments: [{
    filename: String,
    path: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  }],
  verificationStatus: String (enum: pending, verified, rejected, default: pending),
  verificationDate: Date,
  rejectionReason: String,
  rating: Number (0-5, default: 0),
  totalReviews: Number (default: 0),
  completedJobs: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### 1. Register Professional
**POST** `/api/professionals/register`

Register a new professional service provider with profile picture and verification documents.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `firstName` (text, required)
  - `lastName` (text, required)
  - `username` (text, required)
  - `email` (text, required)
  - `phone` (text, required, 10 digits)
  - `serviceCategory` (text, required)
  - `serviceArea` (text, required)
  - `hourlyWage` (number, required)
  - `bio` (text, optional, max 500 chars)
  - `profileImage` (file, optional, max 5MB, types: jpg, png)
  - `documents` (files, required, max 5 files, max 10MB each, types: pdf, jpg, png)

**Response (201):**
```json
{
  "success": true,
  "message": "Professional registration submitted successfully. Verification usually takes 24-48 hours.",
  "data": {
    "id": "60d5ec49c1234567890abcde",
    "username": "ram_pro_2025",
    "email": "ram@example.com",
    "verificationStatus": "pending"
  }
}
```

**Error Response (400/409/500):**
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/professionals/register \
  -F "firstName=Ram" \
  -F "lastName=Bahadur" \
  -F "username=ram_pro_2025" \
  -F "email=ram@example.com" \
  -F "phone=9801234567" \
  -F "serviceCategory=plumbing" \
  -F "serviceArea=thamel" \
  -F "hourlyWage=500" \
  -F "bio=Expert plumber with 10 years experience" \
  -F "profileImage=@/path/to/image.jpg" \
  -F "documents=@/path/to/doc1.pdf" \
  -F "documents=@/path/to/doc2.jpg"
```

---

### 2. Get All Professionals
**GET** `/api/professionals`

Get list of all verified professionals with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `serviceCategory` (string, optional)
- `serviceArea` (string, optional)
- `verificationStatus` (string, default: 'verified')

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
      "phone": "9801234567",
      "serviceCategory": "plumbing",
      "serviceArea": "thamel",
      "hourlyWage": 500,
      "bio": "Expert plumber",
      "profileImage": "./Backend/uploads/professionals/...",
      "rating": 4.5,
      "completedJobs": 25,
      "verificationStatus": "verified"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

**Example:**
```
GET /api/professionals?page=1&limit=10&serviceCategory=plumbing&serviceArea=thamel
```

---

### 3. Search Professionals
**GET** `/api/professionals/search`

Search for verified professionals by category and area.

**Query Parameters:**
- `serviceCategory` (string, optional)
- `serviceArea` (string, optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "firstName": "Ram",
      "username": "ram_pro_2025",
      "serviceCategory": "plumbing",
      "rating": 4.5,
      "completedJobs": 25
    }
  ]
}
```

**Example:**
```
GET /api/professionals/search?serviceCategory=plumbing&serviceArea=thamel
```

---

### 4. Get Professional by Username
**GET** `/api/professionals/user/:username`

Get verified professional profile by username.

**Parameters:**
- `username` (string, required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Ram",
    "lastName": "Bahadur",
    "username": "ram_pro_2025",
    "email": "ram@example.com",
    "phone": "9801234567",
    "serviceCategory": "plumbing",
    "serviceArea": "thamel",
    "hourlyWage": 500,
    "bio": "Expert plumber",
    "profileImage": "./Backend/uploads/professionals/...",
    "rating": 4.5,
    "totalReviews": 30,
    "completedJobs": 25,
    "verificationStatus": "verified",
    "createdAt": "2025-02-01T10:30:00Z"
  }
}
```

**Example:**
```
GET /api/professionals/user/ram_pro_2025
```

---

### 5. Get Professional Profile by ID
**GET** `/api/professionals/:id`

Get specific professional profile by their MongoDB ID.

**Parameters:**
- `id` (string, required, MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Ram",
    ...
  }
}
```

---

### 6. Update Professional Profile
**PUT** `/api/professionals/:id`

Update professional's profile information.

**Request:**
- **Content-Type:** `multipart/form-data` (if updating image) or `application/json`
- **Body (JSON):**
  ```json
  {
    "firstName": "Updated Name",
    "lastName": "Updated Last",
    "bio": "Updated bio",
    "hourlyWage": 600,
    "serviceArea": "patan",
    "phone": "9809876543"
  }
  ```
- **Or multipart for image:**
  - `firstName` (text, optional)
  - `bio` (text, optional)
  - `profileImage` (file, optional, max 5MB)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Updated Name",
    ...
  }
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:5000/api/professionals/60d5ec49c1234567890abcde \
  -H "Content-Type: application/json" \
  -d '{
    "hourlyWage": 600,
    "bio": "Updated bio"
  }'
```

---

### 7. Delete Professional Profile
**DELETE** `/api/professionals/:id`

Delete a professional profile.

**Parameters:**
- `id` (string, required, MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "message": "Professional profile deleted successfully"
}
```

---

### 8. Get Pending Applications (Admin)
**GET** `/api/professionals/admin/pending`

Get list of pending professional applications waiting for verification.

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
      "lastName": "Bahadur",
      "username": "ram_pro_2025",
      "email": "ram@example.com",
      "serviceCategory": "plumbing",
      "serviceArea": "thamel",
      "hourlyWage": 500,
      "verificationDocuments": [
        {
          "filename": "doc-1234567890.pdf",
          "originalName": "certificate.pdf",
          "size": 245000,
          "uploadedAt": "2025-02-01T10:30:00Z"
        }
      ],
      "verificationStatus": "pending",
      "createdAt": "2025-02-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

**Example:**
```
GET /api/professionals/admin/pending?page=1&limit=10
```

---

### 9. Verify Professional (Admin)
**PATCH** `/api/professionals/admin/verify/:id`

Approve or reject a professional's registration.

**Parameters:**
- `id` (string, required, MongoDB ObjectId)

**Request (JSON):**
```json
{
  "status": "verified",
  "rejectionReason": "optional reason if rejected"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Professional verified successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "firstName": "Ram",
    "verificationStatus": "verified",
    "verificationDate": "2025-02-02T10:30:00Z"
  }
}
```

**Example cURL - Verify:**
```bash
curl -X PATCH http://localhost:5000/api/professionals/admin/verify/60d5ec49c1234567890abcde \
  -H "Content-Type: application/json" \
  -d '{
    "status": "verified"
  }'
```

**Example cURL - Reject:**
```bash
curl -X PATCH http://localhost:5000/api/professionals/admin/verify/60d5ec49c1234567890abcde \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Documents not clear. Please resubmit."
  }'
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Missing required fields or invalid data |
| 404 | Not Found | Professional profile not found |
| 409 | Conflict | Email or username already exists |
| 500 | Server Error | Internal server error |

---

## To Integrate These Routes

Add to your `Backend/index.js`:

```javascript
import professionalRoute from './professionalRoute.js';

app.use('/api/professionals', professionalRoute);
```

---

## Notes

- All file uploads are stored in `Backend/uploads/professionals/`
- Profile images max 5MB
- Verification documents max 10MB each (up to 5 files)
- Allowed document formats: PDF, JPG, PNG
- All fields are validated before saving
- Documents are excluded from GET requests by default for security
- Verification status workflow: pending → verified/rejected
- Only verified professionals appear in search results
