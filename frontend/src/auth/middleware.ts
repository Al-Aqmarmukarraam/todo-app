// Authentication middleware for protected routes
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, JWTPayload } from './index';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/tasks',
  // Add more protected routes as needed
];

// Middleware to protect routes
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    // Not a protected route, allow access
    return null;
  }

  // Extract token from cookies or Authorization header
  let token: string | undefined;

  // Check for token in cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookieMatch = cookieHeader.match(/auth_token=([^;]+)/);
    if (cookieMatch) {
      token = cookieMatch[1];
    }
  }

  // If no token in cookies, check Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    // No token found, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    const payload: JWTPayload = await verifyJWT(token);

    // Token is valid, allow access
    // We can also add user info to the request if needed
    return null;
  } catch (error) {
    // Token is invalid or expired, redirect to login
    console.error('Authentication failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Alternative approach: Create a higher-order function for route protection
export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAuth(request);

    if (authResult) {
      // Authentication failed, return the redirect response
      return authResult;
    }

    // Authentication passed, call the original handler
    return handler(request);
  };
}

// Server-side function to check authentication in Server Components
export async function checkAuthServerSide(): Promise<JWTPayload | null> {
  // This would typically be used in server components to check auth status
  // For this example, we'll assume we have access to request headers
  // In practice, this might need to be called differently in server components
  try {
    // In a real implementation, we'd extract the token from the request context
    // This is a simplified version
    return null; // Placeholder - actual implementation would depend on context
  } catch (error) {
    console.error('Server-side auth check failed:', error);
    return null;
  }
}