// Centralized authentication utility for JWT management
import { User } from '../api/client';

// Token storage and retrieval utilities
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    // Ensure token is a valid string and not a malformed value
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined' && token && typeof token === 'string') {
    try {
      localStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Error storing token in localStorage:', error);
    }
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
  }
  return null;
};

export const setUser = (user: User): void => {
  if (typeof window !== 'undefined' && user) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user in localStorage:', error);
    }
  }
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
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
    // Replace URL-safe base64 characters to standard base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' if necessary
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const decodedPayload = atob(paddedBase64);
    const payloadObj = JSON.parse(decodedPayload);

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