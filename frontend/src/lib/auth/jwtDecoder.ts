import { JWTPayload } from '../types';

/**
 * Safely decodes a JWT token without external dependencies
 * This function provides a custom JWT decoding implementation to avoid external dependencies
 * @param token - The JWT token string to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Split the token into its parts
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    if (!payload) {
      console.error('JWT payload part is missing');
      return null;
    }

    // Replace URL-safe characters back to Base64
    const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decode from Base64
    const decodedPayload = atob(base64Payload);

    // Parse as JSON
    const parsedPayload: Partial<JWTPayload> = JSON.parse(decodedPayload);

    // Validate required fields exist
    if (!parsedPayload.userId || !parsedPayload.email || typeof parsedPayload.exp !== 'number') {
      console.error('Invalid JWT payload structure');
      return null;
    }

    // Convert to proper JWTPayload format
    return {
      userId: String(parsedPayload.userId),
      email: String(parsedPayload.email),
      exp: Number(parsedPayload.exp),
      iat: Number(parsedPayload.iat || 0),
      iss: parsedPayload.iss ?? undefined,
      aud: parsedPayload.aud ?? undefined,
      sub: parsedPayload.sub ?? undefined,
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);

  if (!payload) {
    return true; // Consider invalid tokens as expired
  }

  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return payload.exp < currentTime;
}

/**
 * Validates a JWT token (checks format and expiration)
 * @param token - The JWT token to validate
 * @returns True if valid, false otherwise
 */
export function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Check if token has proper format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Check if token is expired
  return !isTokenExpired(token);
}

// Export the original jwtUtils functions for compatibility
export * from './jwtUtils';