// Helper functions for authentication operations
import { api } from './safeFetchWrapper';
import { getToken, setToken, setUser, clearAuthStorage } from './utils';

/**
 * Checks if the current token is valid by attempting to fetch user profile
 * @returns Promise<boolean> indicating if the token is valid
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) {
      return false;
    }

    // Attempt to fetch user profile to validate token
    const response = await api.get('/auth/me');

    if (response.success && response.data) {
      // Update user in storage
      setUser(response.data);
      return true;
    } else {
      // If the response indicates unauthorized or no token found, clear storage
      if (response.error === 'UNAUTHORIZED' || response.error === 'NO_TOKEN_FOUND') {
        clearAuthStorage();
      }
      return false;
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Performs login and stores the token and user data
 * @param email User's email
 * @param password User's password
 * @returns Promise with success status and data/error
 */
export const performLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      return {
        success: false,
        error: errorData.error || `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Store the token and user data
    if (data.access_token && data.user) {
      setToken(data.access_token);
      setUser(data.user);

      return {
        success: true,
        data: {
          token: data.access_token,
          user: data.user,
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred during login',
    };
  }
};

/**
 * Performs registration and stores the token and user data
 * @param email User's email
 * @param username User's username
 * @param password User's password
 * @returns Promise with success status and data/error
 */
export const performRegistration = async (email: string, username: string, password: string) => {
  try {
    const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000'}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
      return {
        success: false,
        error: errorData.error || `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Store the token and user data
    if (data.access_token && data.user) {
      setToken(data.access_token);
      setUser(data.user);

      return {
        success: true,
        data: {
          token: data.access_token,
          user: data.user,
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred during registration',
    };
  }
};

/**
 * Performs logout by clearing auth storage
 */
export const performLogout = () => {
  clearAuthStorage();
};

/**
 * Gets the current user from storage
 * @returns User object or null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Checks if user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }

  // For now, just check if token exists
  // In a production app, you'd want to validate the JWT expiration
  return true;
};