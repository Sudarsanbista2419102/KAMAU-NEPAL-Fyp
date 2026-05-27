# User Signup Use Case

## Actor
**User** - A person who wants to create an account on the platform to find and book services

---

## Use Cases

### Use Case 1: Sign Up

**Actors**: User, Email Service System

**Preconditions**:
- User has internet access
- User has a valid email address
- User is not already registered

**Main Flow**:

1. User opens the signup page
2. User enters the following information:
   - Name
   - Email address
   - Password
   - Address
3. System validates the inputs:
   - All fields are required (except first/last name)
   - Password must have: 8+ characters, uppercase, lowercase, number, special character
   - Email format is valid
4. System checks if email already exists in database
5. If email exists → Show error "User already exists"
6. If email is new → Continue to step 7
7. System hashes the password using bcrypt
8. System generates a 6-digit OTP (One-Time Password)
9. System creates user account in database with status `isVerified = false`
10. System sends OTP to user's email
11. System returns success message with User ID

**Postconditions**:
- User account created in database
- OTP sent to user's email
- User can proceed to OTP verification

**Alternate Flows**:
- If email service fails: Account still created, user notified that email delivery failed

---

### Use Case 2: Verify Email with OTP

**Actors**: User, System

**Preconditions**:
- User has completed signup
- User has received OTP in email
- OTP is valid (not expired - expires in 10 minutes)

**Main Flow**:

1. User opens OTP verification page
2. User enters their User ID
3. User enters the 6-digit OTP from email
4. System finds user by User ID
5. System checks if OTP is correct
6. System checks if OTP is not expired
7. If OTP is incorrect → Show error "Invalid OTP"
8. If OTP is expired → Show error "OTP expired, request new OTP"
9. If OTP is correct and not expired → Continue to step 10
10. System marks user's email as verified (`isVerified = true`)
11. System deletes OTP from database
12. System returns success message and login token

**Postconditions**:
- Email verified successfully
- User account is now active
- User can now login and use the platform

**Alternate Flows**:
- User can request new OTP if expired (Rate limited to 5 times per 24 hours)

---

### Use Case 3: Login

**Actors**: User, System

**Preconditions**:
- User account exists
- Email is verified
- User has correct email and password

**Main Flow**:

1. User opens login page
2. User enters email and password
3. System finds user by email in database
4. System verifies password matches the stored hashed password
5. If password is incorrect → Show error "Invalid credentials"
6. If password is correct → Continue to step 7
7. System generates JWT token (valid for 1 hour)
8. System returns token and user details
9. User is logged in and can access the platform

**Postconditions**:
- User is authenticated
- User can access their dashboard
- User can update profile or search for professionals

---

## Summary Table

| Step | User Action | System Action | Result |
|------|------------|---------------|--------|
| 1 | Opens signup | - | Signup form displayed |
| 2 | Fills form & clicks signup | Validates inputs | Account created if valid |
| 3 | Receives OTP email | Sends OTP | OTP in user's inbox |
| 4 | Enters OTP | Verifies OTP | Email confirmed |
| 5 | Logs in | Validates credentials & generates token | Access granted |
