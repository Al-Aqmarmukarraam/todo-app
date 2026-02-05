// Centralized Authentication Utility for Todo App
// Provides a single source of truth for all auth-related operations

import { api } from './safeFetchWrapper';
import { getToken, setToken, setUser, clearAuthStorage, getUser } from './utils';

interface AuthResponse {
  user: any;
  access_token: string;
  token_type: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Attempts to restore authentication state on app startup
 * @returns Promise with authentication state
 */
export const restoreAuthOnLoad = async (): Promise<{
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}> => {
  try {
    const token = getToken();
    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    // Validate token by fetching user profile
    const response = await api.get('/auth/me');

    if (response.success && response.data) {
      // Update user in storage
      setUser(response.data);

      return {
        isAuthenticated: true,
        user: response.data,
        token,
      };
    } else {
      // Invalid token, clear auth storage
      clearAuthStorage();
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }
  } catch (error) {
    console.error('Error restoring auth on load:', error);
    clearAuthStorage();
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }
};

/**
 * Performs login operation
 * @param email User's email
 * @param password User's password
 * @returns Promise with login result
 */
export const login = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

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
          user: data.user,
          access_token: data.access_token,
          token_type: data.token_type || 'bearer',
        },
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
 * Performs registration operation
 * @param email User's email
 * @param username User's username
 * @param password User's password
 * @returns Promise with registration result
 */
export const register = async (
  email: string,
  username: string,
  password: string
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api'}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      }
    );

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
          user: data.user,
          access_token: data.access_token,
          token_type: data.token_type || 'bearer',
        },
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
 * Performs logout operation
 * @returns Promise that resolves when logout is complete
 */
export const logout = async (): Promise<void> => {
  clearAuthStorage();
};

/**
 * Gets the current user's profile
 * @returns Promise with user profile or null
 */
export const getCurrentUserProfile = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get('/auth/me');

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    } else if (response.error === 'NO_TOKEN_FOUND' || response.error === 'UNAUTHORIZED') {
      // These are not user-facing errors, return as success with no data
      return {
        success: true,
        data: null,
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to fetch user profile',
      };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred while fetching profile',
    };
  }
};

/**
 * Checks if the user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

/**
 * Gets the current user from storage
 * @returns Current user object or null
 */
export const getCurrentUser = (): any | null => {
  return getUser();
};

/**
 * Gets the current authentication token
 * @returns Current token or null
 */
export const getAuthToken = (): string | null => {
  return getToken();
};