# Authentication Flow Documentation for Todo Application Phase 2

## Overview
This document describes the authentication lifecycle and flow implementation for the multi-user todo application.

## Authentication Architecture

### JWT-Based Authentication
The application uses JWT (JSON Web Tokens) for stateless authentication. This approach allows for scalable authentication without server-side session storage.

### Components of the Authentication System

#### 1. JWT Token Structure
When a user authenticates successfully, the backend generates a JWT containing:
- `userId`: Unique identifier for the user
- `email`: User's email address
- `exp`: Token expiration timestamp
- `iat`: Token issued at timestamp

#### 2. Token Storage
- **Client-side**: Tokens are stored in HTTP-only cookies for security
- **Backend**: Tokens are validated using a shared secret/key

## Authentication Flow

### Login Process
1. User submits credentials via login form
2. Credentials are sent to backend authentication endpoint
3. Backend validates credentials against database
4. If valid, backend generates JWT and sets it in HTTP-only cookie
5. Frontend receives success response and redirects to dashboard

### Server-Side Authentication Check
1. **Function**: `checkAuthServerSide(): Promise<JWTPayload | null>`
2. **Location**: `frontend/src/lib/auth/auth.ts`
3. **Process**:
   - Extract JWT from request cookies
   - Send token to backend validation endpoint
   - Receive decoded payload or null if invalid
   - Return payload to server component for rendering decisions

### Client-Side Authentication Check
1. **Process**:
   - Check for authentication token in cookies/local storage
   - Validate token expiration
   - Update authentication context state

### Protected Route Access
1. **Server-Side Protection**:
   - Call `checkAuthServerSide()` in server components
   - If authenticated, render protected content
   - If not authenticated, redirect to login page

2. **Client-Side Protection**:
   - Use authentication context to check user status
   - If authenticated, render protected content
   - If not authenticated, redirect to login page

## Implementation Details

### JWT Decoding Utility
- **File**: `frontend/src/lib/auth/jwtUtils.ts`
- **Purpose**: Safely decode JWT tokens without external dependencies
- **Security**: Validates token structure and expiration before returning payload

### Authentication Context
- **File**: `frontend/src/lib/auth/context.tsx`
- **Purpose**: Centralize authentication state across the application
- **Features**: Loading states, user data, logout functionality

### Middleware Protection
- **File**: `frontend/src/auth/middleware.ts`
- **Purpose**: Protect routes at the Next.js middleware level
- **Behavior**: Redirect unauthenticated users before page load

## Error Handling

### Invalid Token Scenarios
1. **Expired Token**: Redirect to login page
2. **Malformed Token**: Clear token and redirect to login
3. **Invalid Signature**: Clear token and redirect to login

### Network Error Handling
1. **Token Validation Failure**: Display error message
2. **Network Timeout**: Show appropriate error state
3. **Server Unavailable**: Graceful degradation with offline mode

## Security Considerations

### Token Security
- Use HTTP-only cookies to prevent XSS attacks
- Set secure flag for HTTPS connections
- Set appropriate expiration times
- Implement proper token refresh mechanisms

### CSRF Protection
- Use SameSite cookie attribute
- Implement proper request validation
- Validate referer header when appropriate

### Rate Limiting
- Implement rate limiting on authentication endpoints
- Prevent brute force attacks
- Temporary lockout after multiple failures

## Fallback Mechanisms

### Unauthenticated User Experience
1. **Dashboard Access**: Redirect to login page
2. **API Requests**: Return 401 Unauthorized
3. **UI Elements**: Hide protected content
4. **Navigation**: Show public routes only

### Safe Fallback UI
- Display appropriate messaging for unauthorized access
- Provide clear path to authentication
- Maintain consistent user experience
- Preserve user's intended destination for post-login redirect

## Testing Considerations

### Unit Tests
- JWT decoding functionality
- Token expiration validation
- Authentication state management

### Integration Tests
- End-to-end authentication flow
- Protected route access
- Error state handling

### Security Tests
- Token tampering attempts
- Session hijacking prevention
- Proper error responses