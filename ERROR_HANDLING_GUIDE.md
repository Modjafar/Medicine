# MediTrack Error Handling Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Folder Structure](#folder-structure)
4. [Frontend Error Handling](#frontend-error-handling)
5. [Backend Error Handling](#backend-error-handling)
6. [Database Error Handling](#database-error-handling)
7. [Best Practices](#best-practices)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide documents the **production-ready error handling system** implemented for the MediTrack medicine reminder application. It covers both frontend (React.js) and backend (Node.js/Express.js/MongoDB) error handling with real code examples from the project.

### What We Built

A comprehensive error handling system that:

- ✅ Catches and handles errors at every layer of the application
- ✅ Provides user-friendly error messages
- ✅ Hides sensitive server details in production
- ✅ Prevents server crashes from unhandled errors
- ✅ Retries failed database connections automatically
- ✅ Rate-limits API requests to prevent abuse
- ✅ Validates all user inputs before processing
- ✅ Logs errors professionally for debugging

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

New packages added:
- `winston` — Professional logging
- `express-rate-limit` — API rate limiting
- `express-validator` — Request validation

### 2. Environment Variables

Make sure your `.env` file includes:

```env
NODE_ENV=development
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-uri
```

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                 # Database connection with retry logic
├── controllers/
│   ├── authController.js     # Uses asyncHandler, custom errors
│   ├── medicineController.js
│   ├── familyController.js
│   ├── historyController.js
│   └── reminderController.js
├── middleware/
│   ├── asyncHandler.js       # Wraps async functions to catch errors
│   ├── auth.js               # JWT authentication with custom errors
│   ├── authorize.js          # Resource ownership checks
│   ├── globalErrorHandler.js # Central error handling middleware
│   ├── notFound.js           # 404 handler
│   ├── rateLimiter.js        # Rate limiting configuration
│   └── validate.js           # Input validation rules
├── utils/
│   ├── errors/               # Custom error classes
│   │   ├── AppError.js
│   │   ├── ValidationError.js
│   │   ├── AuthError.js
│   │   ├── NotFoundError.js
│   │   ├── DatabaseError.js
│   │   └── index.js
│   ├── logger.js             # Winston logger setup
│   └── responseHandler.js    # Standardized API responses

frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx   # Catches React rendering errors
│   │   ├── ErrorMessage.jsx    # Reusable error display
│   │   ├── FormInput.jsx       # Input with validation errors
│   │   ├── LoadingSpinner.jsx  # Loading indicator
│   │   └── NotFound.jsx        # 404 page
│   ├── hooks/
│   │   ├── useApi.js           # API calls with loading/error states
│   │   └── useForm.js          # Form validation hook
│   ├── services/
│   │   └── api.js              # Axios instance with interceptors
│   └── pages/
│       ├── Login.jsx           # Uses useForm + FormInput
│       └── Register.jsx
```

---

## Frontend Error Handling

### 1. Form Validation Errors

**Before (Problem):**
```jsx
// No validation before submitting — server rejects invalid data
const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password); // Could fail with vague error
};
```

**After (Solution):**
```jsx
// Client-side validation with instant feedback
import useForm from '../hooks/useForm';
import FormInput from '../components/FormInput';

const { values, errors, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '', password: '' },
    {
        email: { required: true, email: true },
        password: { required: true, minLength: 6 }
    },
    async (formValues) => {
        await login(formValues.email, formValues.password);
    }
);

<FormInput
    label="Email"
    name="email"
    value={values.email}
    onChange={handleChange}
    onBlur={handleBlur}  // Validates on blur
    error={errors.email}  // Shows inline error
/>
```

**How it works:**
- `useForm` hook manages form state and validation
- Rules defined per field: `required`, `email`, `minLength`, `maxLength`, `match`
- Validation runs on blur (when user leaves field)
- Errors display inline below each input
- Form won't submit if validation fails

### 2. Required Field Errors

```jsx
// In useForm validation rules
const validationRules = {
    name: { required: true },           // "Name is required"
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
};

// FormInput shows red border and error message
<FormInput
    label="Email"
    name="email"
    error={errors.email}  // "Email is required" or "Please enter a valid email"
    required
/>
```

### 3. Invalid Email/Password Errors

**Backend (returns structured error):**
```javascript
// authController.js
if (!user) {
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
}
```

**Frontend (displays user-friendly message):**
```jsx
// api.js interceptor adds friendlyMessage to errors
const message = error.friendlyMessage || 'Login failed. Please try again.';
toast.error(message);
```

### 4. API Request Failed Errors

**useApi Hook — Centralized API Error Handling:**
```jsx
import useApi from '../hooks/useApi';

const { data, loading, error, errorMessage, execute } = useApi(
    () => api.get('/medicines'),
    true,  // Execute immediately
    []     // Dependencies
);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={errorMessage} />;
```

**Features:**
- Automatic loading states
- User-friendly error messages
- Distinguishes network vs server errors
- Status code-specific messages

### 5. Network Connection Errors

**api.js Interceptor detects network failures:**
```javascript
if (!error.response) {
    error.friendlyMessage = 
        'Network error. Please check your internet connection and try again.';
}
```

**Retry Logic for idempotent requests:**
```javascript
import { retryRequest } from '../services/api';

// Automatically retries up to 2 times with exponential backoff
const medicines = await retryRequest(() => api.get('/medicines'));
```

### 6. Loading States

**LoadingSpinner Component:**
```jsx
import LoadingSpinner from '../components/LoadingSpinner';

// Full-screen loading
<LoadingSpinner fullScreen text="Loading your medicines..." />

// Inline loading
<LoadingSpinner size="sm" />

// Used in PrivateRoute
if (loading) return <LoadingSpinner fullScreen text="Loading..." />;
```

### 7. Toast / Alert Messages

**Using react-toastify with our error system:**
```jsx
import { toast } from 'react-toastify';

// Success
toast.success('Medicine added successfully!');

// Error from API
try {
    await api.post('/medicines', data);
} catch (error) {
    toast.error(error.friendlyMessage || 'Something went wrong');
}
```

### 8. React Error Boundary

**What it catches:** React rendering errors (not caught by try-catch)

```jsx
// App.js — Wraps entire app
<ErrorBoundary>
    <AuthProvider>
        <Router>...</Router>
    </AuthProvider>
</ErrorBoundary>
```

**Features:**
- Catches crashes in any child component
- Shows user-friendly fallback UI
- "Reload Page" and "Try Again" buttons
- Shows debug info in development only
- Logs errors for debugging

### 9. 404 Page Not Found

```jsx
// App.js — Catch-all route
<Route path="*" element={<NotFound />} />

// NotFound.jsx
const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center">
        <h1>404</h1>
        <p>Page Not Found</p>
        <Link to="/">Back to Dashboard</Link>
    </div>
);
```

### 10. Unauthorized Access Redirect

**Automatic handling in api.js interceptor:**
```javascript
case 401:
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
        window.location.href = '/login';
    }, 1500);
    break;
```

**Auth middleware on backend returns specific error codes:**
```javascript
if (error.name === 'TokenExpiredError') {
    throw new AuthError('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
}
```

---

## Backend Error Handling

### 1. Try-Catch in Controllers

**Before (repetitive try-catch in every function):**
```javascript
exports.getMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

**After (clean asyncHandler wrapper):**
```javascript
const asyncHandler = require('../middleware/asyncHandler');

exports.getMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        throw new NotFoundError('Medicine', 'Medicine not found');
    }
    res.json(responseHandler.success(medicine));
});
```

### 2. Async Error Handler Middleware

```javascript
// asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

**What it does:** Wraps async functions and forwards errors to Express error handler automatically. No more try-catch needed!

### 3. Global Error Middleware

```javascript
// globalErrorHandler.js
module.exports = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // MongoDB CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        error = new NotFoundError(err.path, `Invalid ${err.path}: ${err.value}`);
    }

    // MongoDB Duplicate Key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new ValidationError(`${field} already exists`);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = new ValidationError(messages.join(', '));
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = new AuthError('Invalid token', 'INVALID_TOKEN');
    }
    if (err.name === 'TokenExpiredError') {
        error = new AuthError('Token expired', 'TOKEN_EXPIRED');
    }

    // Send response
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            code: error.errorCode || 'INTERNAL_ERROR',
            message: error.isOperational ? error.message : 'Something went wrong'
        },
        // Stack trace only in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
```

### 4. MongoDB Duplicate Email Error

```javascript
// globalErrorHandler.js automatically handles this:
if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ValidationError(`${field} already exists`);
}

// Response:
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "email already exists"
    }
}
```

### 5. Invalid ObjectId Error

```javascript
// When user sends invalid ID like "abc123"
// Mongoose throws CastError

// globalErrorHandler converts it to:
{
    "success": false,
    "error": {
        "code": "NOT_FOUND",
        "message": "Invalid _id: abc123"
    }
}
```

### 6. JWT Token Errors

```javascript
// auth.js middleware
if (error.name === 'TokenExpiredError') {
    throw new AuthError('Your session has expired. Please log in again.', 'TOKEN_EXPIRED');
}
if (error.name === 'JsonWebTokenError') {
    throw new AuthError('Invalid token. Please log in again.', 'INVALID_TOKEN');
}
```

### 7. Validation Errors

**express-validator for request validation:**
```javascript
// validate.js
const { body } = require('express-validator');

exports.validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
];

// Route
router.post('/register', validateRegister, authController.register);
```

### 8. File Upload Errors

While MediTrack doesn't currently handle file uploads, here's the pattern:

```javascript
const multer = require('multer');
const upload = multer({ 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new ValidationError('Only image files allowed'), false);
        }
        cb(null, true);
    }
});

// Error handling
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            throw new ValidationError('File too large (max 5MB)');
        }
    }
    next(error);
});
```

### 9. Rate Limit Errors

```javascript
// rateLimiter.js
const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.'
        }
    }
});

// Usage in server.js
app.use('/api/', rateLimiter.apiLimiter);
```

### 10. Server Crash Prevention

```javascript
// server.js — Process-level error handlers

// Catch synchronous errors
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1); // Restart via PM2/Docker
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION:', err);
    server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            process.exit(0);
        });
    });
});
```

---

## Database Error Handling

### 1. Connection Failure Handling

```javascript
// db.js
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('MongoDB connection failed:', error.message);
        // Don't exit — retry logic handles this
    }
};
```

### 2. Retry Connection Logic

```javascript
// db.js — Exponential backoff retry
let retries = 0;
const maxRetries = 3;

const connectWithRetry = async () => {
    try {
        await mongoose.connect(dbUri, options);
        retries = 0; // Reset on success
    } catch (error) {
        retries++;
        if (retries >= maxRetries) {
            logger.error('Max retries reached. Exiting...');
            process.exit(1);
        }
        
        const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
        logger.info(`Retrying in ${delay}ms... (${retries}/${maxRetries})`);
        setTimeout(connectWithRetry, delay);
    }
};
```

### 3. Timeout Handling

```javascript
const options = {
    serverSelectionTimeoutMS: 5000,  // 5s to select server
    socketTimeoutMS: 45000,          // 45s socket inactivity
    connectTimeoutMS: 10000,         // 10s initial connection
};
```

---

## Best Practices

### 1. Custom Error Classes

```javascript
// Base class — all errors extend this
class AppError extends Error {
    constructor(message, statusCode, errorCode = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true; // Known, expected errors
        Error.captureStackTrace(this, this.constructor);
    }
}

// Specific errors
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

class AuthError extends AppError {
    constructor(message, code = 'AUTH_ERROR') {
        super(message, 401, code);
    }
}

class NotFoundError extends AppError {
    constructor(resource, message) {
        super(message || `${resource} not found`, 404, 'NOT_FOUND');
    }
}
```

### 2. Proper Status Codes

| Status | When to Use |
|--------|-------------|
| 400 | Bad request, validation errors |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate data) |
| 422 | Unprocessable entity |
| 429 | Too many requests |
| 500 | Server error |
| 502/503 | Service unavailable |

### 3. User-Friendly Messages

**Bad:**
```json
{ "message": "E11000 duplicate key error collection: users index: email_1 dup key: { email: \"test@test.com\" }" }
```

**Good:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "email already exists" } }
```

### 4. Hide Sensitive Errors in Production

```javascript
// globalErrorHandler.js
const message = error.isOperational 
    ? error.message                    // Show operational errors
    : 'Something went wrong';          // Hide programming errors in prod

// Stack traces only in development
...(process.env.NODE_ENV === 'development' && { stack: err.stack })
```

### 5. Logging Errors Professionally

```javascript
// logger.js — Winston configuration
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        process.env.NODE_ENV === 'production'
            ? winston.format.json()           // JSON in production
            : winston.format.colorize()       // Colors in development
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});
```

---

## Testing

### Frontend Testing

```javascript
// Test form validation
test('shows error for invalid email', () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' }
    });
    fireEvent.blur(screen.getByLabelText(/email/i));
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
});

// Test API error display
test('shows error on login failure', async () => {
    server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
            return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
        })
    );
    
    render(<Login />);
    // ... fill form and submit
    
    await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
});
```

### Backend Testing

```javascript
// Test error responses
test('returns 404 for non-existent medicine', async () => {
    const response = await request(app)
        .get('/api/medicines/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
});

// Test validation errors
test('returns 400 for duplicate email', async () => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'existing@test.com', password: '123456' });
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
});
```

---

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Headers already sent" | Multiple `res.json()` calls | Use `return next(error)` or `return res.json()` |
| 500 for all errors | No global error handler | Ensure `globalErrorHandler` is last middleware |
| Frontend shows raw errors | No error interceptor | Check `api.js` response interceptor |
| Database won't connect | Wrong URI or network issue | Check `.env` MONGODB_URI, retry logic will help |
| Token errors not caught | auth middleware issue | Verify `jwt.verify()` error handling |

### Debug Mode

Set `NODE_ENV=development` to see:
- Full stack traces in API responses
- Colorized console logs
- Detailed error information

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `MONGODB_URI`
- [ ] Set strong `JWT_SECRET`
- [ ] Review `logs/error.log` regularly
- [ ] Monitor rate limiting alerts
- [ ] Set up PM2 or Docker for automatic restarts

---

## Summary

This error handling system provides:

1. **Frontend:** Form validation, API error handling, loading states, error boundaries, 404 pages, and auth redirects
2. **Backend:** Async error wrapping, global error handling, custom error classes, MongoDB/JWT error conversion, rate limiting, and crash prevention
3. **Database:** Connection retry logic with exponential backoff, timeout handling, and graceful shutdown
4. **Best Practices:** Proper status codes, user-friendly messages, production-safe error hiding, and professional logging

All errors are caught, logged, and presented to users in a friendly way — making your MediTrack application robust and production-ready.
