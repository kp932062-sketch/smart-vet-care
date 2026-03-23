# VetCare Security Implementation

## Security Features Implemented

### 1. Security Headers (Helmet)
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- And more security headers

### 2. Rate Limiting
- General: 100 requests per 15 minutes per IP
- API endpoints: 50 requests per 15 minutes per IP  
- Auth endpoints: 5 requests per 15 minutes per IP

### 3. Input Sanitization
- MongoDB injection protection
- XSS attack prevention
- Parameter pollution prevention

### 4. Enhanced Authentication
- JWT token validation
- User existence verification
- Account status checking
- Role-based access control

### 5. Input Validation
- Email format validation
- Strong password requirements
- Name and phone validation
- MongoDB ObjectId validation

### 6. Error Handling
- Secure error messages
- Proper HTTP status codes
- Development vs production error details

## Configuration

### Environment Variables Required
```
RATE_LIMIT_MAX=100          # Max requests per window
JWT_SECRET=your-secret      # Strong JWT secret (min 32 chars)
NODE_ENV=production         # Environment setting
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character (@$!%*?&)

### Rate Limiting Rules
- **General endpoints**: 100 requests/15min per IP
- **API endpoints**: 50 requests/15min per IP
- **Auth endpoints**: 5 requests/15min per IP

## Usage Examples

### Using Role-based Middleware
```javascript
// Admin only endpoint
router.get('/admin-data', auth, adminOnly, (req, res) => {
  // Only admin/owner can access
});

// Doctor only endpoint  
router.get('/doctor-data', auth, doctorOnly, (req, res) => {
  // Only doctors can access
});

// Multiple roles
router.get('/user-data', auth, authorize('user', 'farmer'), (req, res) => {
  // Users and farmers can access
});
```

### Using Input Validation
```javascript
// With validation
router.post('/register', registerValidation, (req, res) => {
  // Registration with full validation
});

router.post('/login', loginValidation, (req, res) => {
  // Login with email/password validation
});
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep dependencies updated**
3. **Monitor rate limit violations**
4. **Regular security audits**
5. **Proper error logging**
6. **Database connection security**
7. **File upload restrictions**

## Installation

Install the required security packages:

```bash
npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp express-validator
```

## Testing Security

1. **Rate Limiting**: Try making multiple rapid requests
2. **XSS Protection**: Try submitting script tags in forms
3. **SQL Injection**: Try MongoDB injection patterns
4. **Authentication**: Test with expired/invalid tokens
5. **Authorization**: Test accessing endpoints without proper roles

## Monitoring

Monitor these security metrics:
- Rate limit violations
- Failed authentication attempts  
- Invalid token usage
- Suspicious input patterns
- Error rates and types

## Updates

Security is an ongoing process. Regular updates needed for:
- Dependency updates
- Security patches
- New threat patterns
- Enhanced monitoring
