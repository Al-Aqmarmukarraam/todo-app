// Centralized Authentication Utility for Todo App
// Handles signup, login, logout, token management, and session persistence

import { apiClient } from './api/client';
import { setToken, setUser, clearAuthStorage, getToken, getUser, isAuthenticated as isTokenValid } from './auth/utils';

// Define types for auth responses
interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    created_at: string;
  };
  token: string;
  message: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  username: string;
  password: string;
}

// Signup function
export const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string }> => {
  try {
    const response = await apiClient.register(credentials.email, credentials.username, credentials.password);

    if (response.success && response.data) {
      // Extract token and user from response
      const { user, access_token } = response.data;

      // Store the token and user data
      setToken(access_token);
      setUser(user);

      return {
        success: true,
        data: { user, token: access_token, message: 'Signup successful' }
      };
    } else {
      return {
        success: false,
        error: response.error || 'Signup failed'
      };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signup failed'
    };
  }
};

// Login function
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string }> => {
  try {
    const response = await apiClient.login(credentials.email, credentials.password);

    if (response.success && response.data) {
      // Extract token and user from response
      const { user, access_token } = response.data;

      // Store the token and user data
      setToken(access_token);
      setUser(user);

      return {
        success: true,
        data: { user, token: access_token, message: 'Login successful' }
      };
    } else {
      return {
        success: false,
        error: response.error || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    };
  }
};

// Logout function
export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Clear all auth data from storage
    clearAuthStorage();

    // Note: In a real app, you might want to call a backend logout endpoint
    // that invalidates the JWT on the server side, but with stateless JWTs,
    // the main thing is to clear the client-side token

    return {
      success: true
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return getUser();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return isTokenValid();
};

// Get auth token
export const getAuthToken = () => {
  return getToken();
};

// Refresh token if needed (placeholder implementation)
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  // In a real implementation, you would check if the token is expired
  // and call a refresh endpoint if available
  // For this implementation with short-lived JWTs, we'll just return the current status

  const isValid = isTokenValid();
  if (!isValid) {
    // Token is invalid, clear auth storage
    clearAuthStorage();
  }
  return isValid;
};

// Verify session (check if user profile can be fetched with current token)
export const verifySession = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const response = await apiClient.getUserProfile();

    if (response.success && response.data) {
      // Update user in storage
      setUser(response.data);
      return {
        success: true,
        user: response.data
      };
    } else {
      return {
        success: false,
        error: response.error || 'Session verification failed'
      };
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Session verification failed'
    };
  }
};

// Handle 401 errors globally (could be used with an interceptor pattern)
export const handleUnauthorized = () => {
  // Clear auth data when receiving a 401
  clearAuthStorage();
};

export default {
  signup,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  refreshTokenIfNeeded,
  verifySession,
  handleUnauthorized
};