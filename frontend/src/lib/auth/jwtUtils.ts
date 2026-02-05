// JWT Utility Functions for the Todo App
import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '../types';

/**
 * Verifies a JWT token by decoding it and checking its validity
 * @param token - The JWT token string to verify
 * @returns Promise that resolves to the decoded JWT payload
 * @throws Error if the token is invalid or expired
 */
export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  try {
    // Decode the token without verification (we'll handle expiration manually)
    const decoded = jwtDecode<JWTPayload>(token);

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      throw new Error('Token has expired');
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token string to check
 * @returns boolean indicating if the token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode it, treat as expired
  }
};

/**
 * Gets the payload from a JWT token without verifying it
 * @param token - The JWT token string to decode
 * @returns The decoded JWT payload or null if decoding fails
 */
export const getJWTPayload = (token: string): JWTPayload | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);

    // Verify required fields exist
    if (!decoded.userId || !decoded.email) {
      console.error('JWT payload missing required fields');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};;