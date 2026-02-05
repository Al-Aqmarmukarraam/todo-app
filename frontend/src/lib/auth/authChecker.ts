'use client';

import { JWTPayload } from '../types';
import { getJWTPayload, isTokenExpired } from './jwtUtils';

/**
 * Checks authentication status on the server side
 * This function would typically extract and validate a JWT token from cookies or headers
 * @returns Promise<JWTPayload | null> - The decoded JWT payload if authenticated, null otherwise
 */
export async function checkAuthServerSide(): Promise<JWTPayload | null> {
  try {
    // In a real implementation, this would extract the token from cookies or request headers
    // For now, we'll simulate getting the token from document.cookie in a client component
    // but in a true server component, we'd get it from the request headers

    // Get token from localStorage (or cookie in a real implementation)
    const token = localStorage.getItem('access_token') || getCookie('access_token');

    if (!token) {
      console.log('No token found in storage');
      return null;
    }

    // Validate the token
    const payload = getJWTPayload(token);
    if (!payload || isTokenExpired(token)) {
      console.log('Invalid or expired token');
      return null;
    }

    // Return the decoded payload
    return payload;
  } catch (error) {
    console.error('Error checking server-side auth:', error);
    return null;
  }
}

/**
 * Helper function to get cookie by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    // This won't work in a true server component, but serves as placeholder
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Server component compatible version (would be used in actual server components)
 * This version would be imported in server components and use request headers
 * @param cookies - The cookies object passed from the server component
 * @returns Promise<JWTPayload | null> - The decoded JWT payload if authenticated, null otherwise
 */
export async function checkAuthServerSideWithCookies(cookies: Partial<Record<string, string>>): Promise<JWTPayload | null> {
  try {
    // Extract token from cookies
    const token = cookies['access_token'];

    if (!token) {
      console.log('No token found in cookies');
      return null;
    }

    // Validate the token
    if (!isValidTokenFormat(token)) {
      console.log('Invalid token format');
      return null;
    }

    // Decode and return the payload
    const payload = getJWTPayload(token);
    if (!payload || isTokenExpired(token)) {
      console.log('Invalid or expired token');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error checking server-side auth with cookies:', error);
    return null;
  }
}

/**
 * Validates if a token has proper JWT format (3 parts separated by dots)
 * @param token - The token to validate
 * @returns boolean - True if format is valid, false otherwise
 */
function isValidTokenFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3;
}