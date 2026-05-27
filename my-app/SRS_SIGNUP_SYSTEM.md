# Software Requirements Specification (SRS)
## User Signup & Professional Registration System

---

## 1. INTRODUCTION

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the User Signup and Professional Registration system of the service provider platform. It provides a comprehensive overview of the system's capabilities, constraints, and interfaces.

### 1.2 Scope
The system includes:
- User account creation and registration
- Email verification through OTP
- Professional service provider registration
- Document submission and verification
- Admin review and approval workflow
- User authentication and login

### 1.3 Document Conventions
- **Shall** = Mandatory requirement
- **Should** = Recommended requirement
- **May** = Optional requirement
- **FR** = Functional Requirement
- **NFR** = Non-Functional Requirement

### 1.4 Intended Audience
- Development Team
- QA Team
- Project Managers
- Stakeholders

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective
This is a web-based service provider platform connecting users with service professionals (plumbers, electricians, etc.). The signup system is the entry point for both user types.

### 2.2 Product Features
- User registration with email verification
- Professional registration with document upload
- Admin verification workflow
- OTP-based email verification
- Password security validation
- Profile management

### 2.3 User Classes and Characteristics

| User Class | Description | Frequency |
|-----------|-------------|-----------|
| **Regular User** | Seeks services from professionals | High |
| **Professional** | Offers services; requires verification | Medium |
| **Administrator** | Manages professional verification | Low |
| **System** | Email service provider | Continuous |

### 2.4 Operating Environment
- **Frontend**: React/Vite
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Email Service**: Gmail/SMTP
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Devices**: Desktop, Tablet, Mobile

### 2.5 Design and Implementation Constraints
- Password must meet security requirements
- OTP valid for 10 minutes
- Email delivery may fail gracefully
- Maximum file size: 30MB for documents, 100MB for profile images
- Supported file types: JPEG, PNG, PDF

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 User Signup (FR-1)

#### 3.1.1 Signup Request
**ID**: FR-1.1  
**Title**: User Registration  
**Description**: User shall be able to register with email, password, name, and address.

**Preconditions**:
- User has not registered before
- Internet connection available

**Main Flow**:
1. User opens signup page
2. User enters name, first name (optional), last name (optional), email, password, address
3. System validates all inputs
4. System checks if email already exists
5. System hashes password using bcrypt
6. System generates 6-digit OTP
7. System creates user document in database
8. System sends OTP via email
9. System returns success message with User ID

**Postconditions**:
- User record created in database
- `isVerified = false`
- OTP stored (expires in 10 minutes)

**Input Validation Rules** (FR-1.1.1):
| Field | Validation |
|-------|-----------|
| **Name** | Required, non-empty |
| **Email** | Required, valid format, not duplicate |
| **Password** | Min 8 chars, uppercase, lowercase, number, special char |
| **Address** | Required, non-empty |
| **First Name** | Optional, max 50 chars |
| **Last Name** | Optional, max 50 chars |

**Error Handling** (FR-1.1.2):
- Missing fields → Return 400 error
- Duplicate email → Return 409 error
- Invalid password → Return 400 error with requirements
- Email sending fails → Still create account, notify user

---

### 3.2 OTP Generation and Sending (FR-2)

#### 3.2.1 OTP Generation
**ID**: FR-2.1  
**Title**: Generate and Send OTP  
**Description**: System shall generate a 6-digit OTP and send it to user's email.

**Specifications**:
- OTP length: 6 digits (100000-999999)
- OTP expiration: 10 minutes from generation
- One-time use only
- Case-sensitive when stored

**Email Service** (FR-2.1.1):
- Service: Gmail/SMTP
- Sender: system email address
- Subject: "Your OTP for Email Verification"
- Template: HTML formatted with OTP prominently displayed

**Fallback Behavior** (FR-2.1.2):
- If email fails, OTP still generated
- System returns 201 success with flag `emailFailed: true`
- Backend logs OTP for dev environment

---

### 3.3 OTP Verification (FR-3)

#### 3.3.1 Verify OTP
**ID**: FR-3.1  
**Title**: Verify Email with OTP  
**Description**: User shall enter OTP to verify email address.

**Preconditions**:
- User has completed signup
- User has valid User ID
- OTP not expired

**Main Flow**:
1. User receives OTP email
2. User copies OTP from email
3. User enters OTP on verification page
4. System finds user by User ID
5. System checks OTP validity (not expired, correct value)
6. System marks email as verified
7. System removes OTP from database
8. System returns success message

**Postconditions**:
- `isVerified = true`
- `otp = null`
- Account ready for login

**Error Cases** (FR-3.1.1):
| Error | Status | Message |
|-------|--------|---------|
| User not found | 404 | User not found |
| Missing User ID or OTP | 400 | User ID and OTP required |
| No OTP generated | 400 | No OTP found. Please signup again |
| OTP mismatch | 400 | Invalid OTP |
| OTP expired | 400 | OTP expired. Request new OTP |

---

### 3.4 OTP Resend (FR-4)

#### 3.4.1 Resend OTP
**ID**: FR-4.1  
**Title**: Resend OTP  
**Description**: User shall be able to request a new OTP if expired.

**Specifications**:
- Maximum resend attempts: Configurable (e.g., 5 per 24 hours)
- Cooldown period: 1 minute between requests
- New OTP invalidates previous one

---

### 3.5 User Login (FR-5)

#### 3.5.1 Login
**ID**: FR-5.1  
**Title**: User Login  
**Description**: Verified user shall login with email and password.

**Preconditions**:
- User account verified
- Email and password correct

**Main Flow**:
1. User enters email and password
2. System finds user by email
3. System verifies password with bcrypt
4. System generates JWT token
5. System returns token and user details

**JWT Token Contents**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Token Expiration**: 1 hour (configurable)

---

### 3.6 Professional Registration (FR-6)

#### 3.6.1 Register as Professional
**ID**: FR-6.1  
**Title**: Professional Account Registration  
**Description**: Verified user shall register as service professional with required documents.

**Preconditions**:
- User account created and verified
- User authenticated (JWT token)

**Required Information**:
| Field | Type | Required | Max Length |
|-------|------|----------|-----------|
| Business Name | String | Yes | 100 |
| Category | Enum | Yes | - |
| Service Area | String | Yes | 100 |
| Phone | String | Yes | 20 |
| Bio | String | No | 500 |
| Experience Years | Number | Yes | - |
| Hourly Rate | Number | Yes | - |
| Profile Image | File | Yes | 30MB |
| Cover Image | File | No | 30MB |
| Documents | Files | Yes | 5 max, 30MB each |

**Service Categories** (FR-6.1.1):
- Plumbing
- Electrical
- Carpentry
- Cleaning
- Painting
- HVAC
- General Handyman
- [Others as per database]

**Document Requirements** (FR-6.1.2):
- Minimum 1 document required
- Maximum 5 documents
- Accepted formats: PDF, JPEG, PNG
- Each file max 30MB
- Recommended documents:
  - Government ID
  - Professional License
  - Certification
  - Insurance Certificate

**Main Flow**:
1. User navigates to professional registration
2. User enters all required fields
3. User uploads profile image (required)
4. User uploads cover image (optional)
5. User uploads documents (1-5 files)
6. System validates all inputs and file sizes
7. System stores files to `/uploads/professionals`
8. System creates professional record
9. System sets `verificationStatus = 'pending'`
10. System returns success message

**Postconditions**:
- Professional record created
- Application in pending state
- Visible in admin review queue

---

### 3.7 Admin Verification (FR-7)

#### 3.7.1 Review Applications
**ID**: FR-7.1  
**Title**: Admin Reviews Professional Applications  
**Description**: Admin shall review and approve/reject professional applications.

**Admin Privileges**:
- View all pending applications
- View professional details and documents
- Approve professional
- Reject with reason
- Request additional documents

**Verification Status States**:
- `pending` - Awaiting admin review
- `verified` - Approved and active
- `rejected` - Rejected by admin
- `suspended` - Blocked for violations

**Approval Process** (FR-7.1.1):
1. Admin views pending applications list
2. Admin selects application to review
3. Admin reviews documents and information
4. Admin approves or rejects
5. System updates verification status
6. System sends notification to professional
7. Professional profile becomes searchable (if approved)

---

### 3.8 User Profile Management (FR-8)

#### 3.8.1 Update Profile
**ID**: FR-8.1  
**Title**: User Profile Update  
**Description**: User shall update profile information.

**Updatable Fields**:
- First Name
- Last Name
- Address
- Phone Number
- Profile Picture
- Bio

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance (NFR-1)

**NFR-1.1**: Signup should complete within 3 seconds  
**NFR-1.2**: OTP verification should complete within 1 second  
**NFR-1.3**: File upload should support up to 30MB  
**NFR-1.4**: System should handle 1000 concurrent users  

### 4.2 Security (NFR-2)

**NFR-2.1**: Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

**NFR-2.2**: Password Hashing
- Algorithm: bcrypt with salt rounds = 10
- Never store plain passwords

**NFR-2.3**: JWT Security
- Secret key: Environment variable (JWT_SECRET)
- Token expiration: 1 hour
- Refresh token mechanism: [Optional]

**NFR-2.4**: OTP Security
- Length: 6 digits
- Expiration: 10 minutes
- Rate limiting: Max 5 resend requests per 24 hours
- One-time use only

**NFR-2.5**: Input Validation
- All inputs validated on server-side
- SQL injection prevention via Mongoose
- XSS prevention via sanitization
- Email validation: RFC 5322 format

**NFR-2.6**: File Upload Security
- Whitelist allowed MIME types
- Scan for malware before storage
- Store outside web root
- Validate file headers (magic bytes)

**NFR-2.7**: Data Protection
- HTTPS only
- Sensitive data encrypted at rest
- No sensitive data in logs
- GDPR compliant

### 4.3 Availability (NFR-3)

**NFR-3.1**: System uptime: 99.5% availability  
**NFR-3.2**: Planned maintenance window: Weekly, 2 hours  
**NFR-3.3**: Backup frequency: Daily  
**NFR-3.4**: Recovery time objective (RTO): 1 hour  

### 4.4 Scalability (NFR-4)

**NFR-4.1**: Database
- Support growth to 1 million users
- Implement indexing on frequently queried fields
- Archive old records

**NFR-4.2**: File Storage
- Use cloud storage (e.g., AWS S3, Azure Blob)
- CDN for faster delivery
- Automatic cleanup of rejected applications

### 4.5 Maintainability (NFR-5)

**NFR-5.1**: Code Quality
- Unit test coverage: >80%
- ESLint for code consistency
- Code reviews before merge

**NFR-5.2**: Documentation
- API documentation with Swagger/OpenAPI
- Code comments for complex logic
- README with setup instructions

### 4.6 Usability (NFR-6)

**NFR-6.1**: Responsive Design
- Works on desktop, tablet, mobile
- Mobile-first approach

**NFR-6.2**: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation

**NFR-6.3**: User Experience
- Clear error messages
- Progress indicators for multi-step forms
- Form validation feedback in real-time

---

## 5. EXTERNAL INTERFACE REQUIREMENTS

### 5.1 User Interfaces (UI)

#### 5.1.1 Signup Page
- Email input field
- Password input field (masked)
- Name input field
- Address input field
- Signup button
- Password strength indicator
- Link to login page

#### 5.1.2 OTP Verification Page
- 6-digit OTP input (numeric only)
- Resend OTP button (disabled for 60 seconds)
- Timer showing OTP expiration
- Verify button

#### 5.1.3 Professional Registration Form
- Multi-step form (3-4 steps)
- Step 1: Business Information
- Step 2: Upload Documents
- Step 3: Profile Images
- Step 4: Review & Submit
- Progress bar
- Save draft option

#### 5.1.4 Admin Dashboard
- Pending applications list
- Application details view
- Approve/Reject buttons
- Verification status filter
- Search functionality

### 5.2 API Interfaces

#### 5.2.1 Signup Endpoint
```
POST /api/users/signup
Content-Type: application/json

Request:
{
  "name": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "address": "123 Main St, City"
}

Response (Success):
{
  "message": "Signup successful. OTP sent to email.",
  "userId": "507f1f77bcf86cd799439011",
  "emailFailed": false
}

Response (Error):
{
  "message": "User already exists"
}
```

#### 5.2.2 Verify OTP Endpoint
```
POST /api/users/verify-otp
Content-Type: application/json

Request:
{
  "userId": "507f1f77bcf86cd799439011",
  "otp": "123456"
}

Response (Success):
{
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (Error):
{
  "message": "Invalid OTP"
}
```

#### 5.2.3 Login Endpoint
```
POST /api/users/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (Success):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### 5.2.4 Professional Registration Endpoint
```
POST /api/professionals/register
Content-Type: multipart/form-data
Authorization: Bearer <token>

Fields:
- businessName: string
- serviceCategory: string
- serviceArea: string
- phone: string
- bio: string (optional)
- experienceYears: number
- hourlyRate: number
- profileImage: file (required)
- coverImage: file (optional)
- documents: files (1-5)

Response (Success):
{
  "success": true,
  "message": "Professional registration submitted",
  "professionalId": "507f1f77bcf86cd799439011",
  "verificationStatus": "pending"
}
```

### 5.3 Hardware Interfaces
- None specific. Works on standard computers/devices with internet.

### 5.4 Software Interfaces

**Email Service**:
- Gmail SMTP configuration
- OAuth2 authentication
- Uses `emailService.js` utility

**Database**:
- MongoDB connection
- Collections: users, professionals, admins
- Mongoose ODM for query abstraction

**File Storage**:
- Local file system: `/uploads/professionals`
- [Future: AWS S3 or Azure Blob Storage]

---

## 6. SYSTEM FEATURES

### 6.1 Feature Matrix

| Feature | User | Professional | Admin |
|---------|------|--------------|-------|
| Signup | ✓ | ✓ | ✗ |
| OTP Verification | ✓ | ✓ | ✗ |
| Login | ✓ | ✓ | ✓ |
| Register as Pro | ✗ | ✓ | ✗ |
| Upload Documents | ✗ | ✓ | ✗ |
| Review Applications | ✗ | ✗ | ✓ |
| Approve/Reject | ✗ | ✗ | ✓ |

---

## 7. OTHER NONFUNCTIONAL REQUIREMENTS

### 7.1 Backup and Recovery
- Daily automated backups
- Point-in-time recovery capability
- Tested monthly

### 7.2 Audit and Logging
- All signup/login attempts logged
- Admin actions logged with timestamp
- Sensitive data not logged (passwords, OTPs)
- Logs retained for 90 days

### 7.3 Compliance
- GDPR compliance for user data
- Data retention policy
- User right to deletion (with constraints)
- Privacy policy and terms acceptance

### 7.4 Error Handling
- User-friendly error messages
- Proper HTTP status codes
- Detailed backend logs
- Error tracking system (e.g., Sentry)

---

## 8. GLOSSARY

| Term | Definition |
|------|-----------|
| **OTP** | One-Time Password (6-digit code) |
| **JWT** | JSON Web Token for authentication |
| **Bcrypt** | Password hashing algorithm |
| **Professional** | Service provider registered on platform |
| **Verification Status** | State of professional application (pending/verified/rejected) |
| **API** | Application Programming Interface |
| **MIME Type** | File type indicator (e.g., image/jpeg) |

---

## 9. APPENDIX

### 9.1 Error Codes Reference

| Code | HTTP Status | Meaning |
|------|-----------|---------|
| SIGNUP_001 | 400 | Missing required fields |
| SIGNUP_002 | 409 | User already exists |
| SIGNUP_003 | 400 | Invalid password format |
| SIGNUP_004 | 500 | Email service error |
| OTP_001 | 400 | Invalid OTP |
| OTP_002 | 400 | OTP expired |
| OTP_003 | 404 | User not found |
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| FILE_001 | 413 | File too large |
| FILE_002 | 400 | Invalid file type |

### 9.2 Sample Test Cases

**TC-1.1**: Valid User Signup
- Input: Valid email, password, name, address
- Expected: Account created, OTP sent, returns userId

**TC-1.2**: Duplicate Email Signup
- Input: Already registered email
- Expected: 409 error, "User already exists"

**TC-1.3**: Weak Password
- Input: "Pass123" (no special char)
- Expected: 400 error, password requirements message

**TC-3.1**: Valid OTP Verification
- Input: Correct OTP within 10 minutes
- Expected: Account verified, token returned

**TC-3.2**: Expired OTP
- Input: Valid OTP after 10 minutes
- Expected: 400 error, "OTP expired"

**TC-6.1**: Professional Registration
- Input: Valid professional data + 2 documents
- Expected: Application created, status = pending

---

## 10. CHANGE LOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-24 | Initial SRS creation |

---

## 11. APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | - | - | - |
| Tech Lead | - | - | - |
| QA Lead | - | - | - |

---

**Document Status**: Draft  
**Last Updated**: May 24, 2026  
**Next Review**: June 24, 2026
