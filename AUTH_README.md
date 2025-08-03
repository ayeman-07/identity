# i-Dentity Authentication System

## Overview
Complete authentication and authorization system for the i-Dentity dental platform using Next.js App Router, JWT, bcrypt, and PostgreSQL via Prisma.

## Features Implemented

### ✅ 1. User Registration (`/api/auth/register`)
- **Method**: POST
- **Body**: `{ name, email, password, role }`
- **Features**:
  - Password hashing with bcrypt (salt rounds: 10)
  - Email uniqueness validation
  - Role validation (CLINIC or LAB)
  - Automatic creation of Clinic/Lab profile
  - JWT token generation (1 day expiration)
  - Transaction-based user and profile creation

### ✅ 2. User Login (`/api/auth/login`)
- **Method**: POST
- **Body**: `{ email, password }`
- **Features**:
  - Password verification with bcrypt
  - User data retrieval with clinic/lab info
  - JWT token generation
  - Secure error messages (no user enumeration)

### ✅ 3. Password Reset System
#### Request Reset (`/api/auth/request-reset`)
- **Method**: POST
- **Body**: `{ email }`
- **Features**:
  - 6-digit OTP generation
  - 15-minute expiration
  - Mock email sending (console.log)
  - Security: No email enumeration

#### Reset Password (`/api/auth/reset-password`)
- **Method**: POST
- **Body**: `{ email, otp, newPassword }`
- **Features**:
  - OTP verification
  - Password hashing
  - Token cleanup after use
  - Transaction-based updates

### ✅ 4. Authentication Middleware (`lib/auth.js`)
- **JWT Verification**: Bearer token validation
- **User Lookup**: Database verification
- **Error Handling**: Token expiration, invalid tokens
- **Role-Based Access**: CLINIC and LAB specific middleware

### ✅ 5. Protected Routes Examples
- **Profile Route** (`/api/profile`): General authentication
- **Clinic Dashboard** (`/api/clinic/dashboard`): CLINIC role required
- **Lab Dashboard** (`/api/lab/dashboard`): LAB role required

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role
  clinic    Clinic?
  lab       Lab?
  createdAt DateTime @default(now())
}
```

### Password Reset Token
```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  email     String   @unique
  token     String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

## Security Features

### 🔒 Password Security
- bcrypt hashing with 10 salt rounds
- Minimum 6 character requirement
- Strong password validation available

### 🔒 JWT Security
- 1-day token expiration
- Configurable JWT_SECRET
- Token verification on every request

### 🔒 Role-Based Access Control
- CLINIC and LAB role separation
- Middleware-based route protection
- 403 Forbidden for unauthorized access

### 🔒 Password Reset Security
- 6-digit OTP with 15-minute expiration
- No email enumeration
- Secure token cleanup

## API Usage Examples

### Registration
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Dr. Smith',
    email: 'dr.smith@clinic.com',
    password: 'securePassword123',
    role: 'CLINIC'
  })
});
```

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dr.smith@clinic.com',
    password: 'securePassword123'
  })
});
```

### Protected Route Access
```javascript
const response = await fetch('/api/clinic/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## File Structure

```
/lib
  auth.js                    # Authentication middleware
  prisma.js                  # Prisma client
/utils
  validation.js              # Validation utilities
/app/api/auth
  /register/route.js         # User registration
  /login/route.js            # User login
  /request-reset/route.js    # Password reset request
  /reset-password/route.js   # Password reset
/app/api/profile/route.js    # Protected profile route
/app/api/clinic/dashboard/route.js  # Clinic-specific route
/app/api/lab/dashboard/route.js     # Lab-specific route
```

## Next Steps

1. **Email Service Integration**: Replace mock email with real service (SendGrid, AWS SES)
2. **Rate Limiting**: Add rate limiting for auth endpoints
3. **Session Management**: Implement refresh tokens
4. **Two-Factor Authentication**: Add 2FA support
5. **Audit Logging**: Track authentication events
6. **Password Policy**: Implement stronger password requirements

## Testing

The system is ready for testing with the provided endpoints. Use tools like Postman or curl to test the authentication flow. 