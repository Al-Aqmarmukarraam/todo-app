// Centralized authentication utility for JWT management
import { User } from '../api/client';

// Token storage and retrieval utilities - COOKIE ONLY
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Get from cookies only (single source of truth)
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (cookieValue && cookieValue !== 'undefined' && cookieValue !== 'null') {
      return cookieValue;
    }
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined' && token && typeof token === 'string') {
    try {
      // Store ONLY in cookies for server-side access in middleware
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      // Use SameSite=None and Secure for cross-site requests when needed
      document.cookie = `auth_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    } catch (error) {
      console.error('Error storing token in cookie:', error);
    }
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    // Remove cookie by setting past expiration
    document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    // Get user from cookies only
    const userStr = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_user='))
      ?.split('=')[1];

    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        return JSON.parse(decodeURIComponent(userStr));
      } catch (error) {
        console.error('Error parsing user from cookie:', error);
        return null;
      }
    }
  }
  return null;
};

export const setUser = (user: User): void => {
  if (typeof window !== 'undefined' && user) {
    try {
      // Store user in cookie
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      const userJson = encodeURIComponent(JSON.stringify(user));
      document.cookie = `auth_user=${userJson};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    } catch (error) {
      console.error('Error storing user in cookie:', error);
    }
  }
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    // Remove user cookie
    document.cookie = 'auth_user=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
};

export const clearAuthStorage = (): void => {
  removeToken();
  removeUser();
};

// Token validation utilities
export const isTokenExpired = (token: string): boolean => {
  try {
    // Check if token is valid JWT format (has 3 parts separated by dots)
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      console.warn('Invalid token format for expiration check');
      return true;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('JWT token does not have 3 parts');
      return true;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    if (!payload) {
      console.warn('JWT payload is empty');
      return true;
    }

    // Replace URL-safe base64 characters to standard base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' if necessary
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    let decodedPayload;
    try {
      decodedPayload = atob(paddedBase64);
    } catch (decodeError) {
      console.error('Error decoding JWT payload:', decodeError);
      return true;
    }

    let payloadObj;
    try {
      payloadObj = JSON.parse(decodedPayload);
    } catch (parseError) {
      console.error('Error parsing JWT payload:', parseError);
      return true;
    }

    // Check if expiration exists and is valid
    if (typeof payloadObj.exp !== 'number') {
      console.warn('Expiration claim not found or invalid in token');
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payloadObj.exp < currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return true; // If we can't validate, assume it's expired
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
};