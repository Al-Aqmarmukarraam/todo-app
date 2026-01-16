// Safe Authentication Utilities for Todo App
// Handles user profile fetching with proper error handling and token validation

import { api } from './safeFetchWrapper';
import { getToken, getUser, isAuthenticated as isTokenValid, clearAuthStorage } from './utils';

// Define types for user profile response
interface UserProfile {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

interface SafeApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safely fetches the current user profile with comprehensive error handling
 * @returns Promise<SafeApiResponse<UserProfile>>
 */
export const fetchCurrentUserProfile = async (): Promise<SafeApiResponse<UserProfile>> => {
  try {
    // Use the safe fetch wrapper to get user profile
    const response = await api.get<UserProfile>('/user/profile');

    if (response.success && response.data) {
      // Validate that the parsed data has required user properties
      if (!response.data || typeof response.data !== 'object' || !response.data.id) {
        return {
          success: false,
          error: 'Invalid user data received from server'
        };
      }

      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to fetch user profile'
      };
    }
  } catch (error) {
    // Handle network errors or other unexpected errors
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while fetching user profile'
    };
  }
};

/**
 * Gets the current user from localStorage with validation
 * @returns UserProfile | null
 */
export const getCurrentUser = (): UserProfile | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr);

    // Validate user object structure
    if (user && typeof user === 'object' && user.id) {
      return user as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Validates the current authentication state
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  // First check if token exists and is valid
  const tokenExists = !!getToken();
  if (!tokenExists) {
    return false;
  }

  // Then try to get user from localStorage
  const user = getCurrentUser();
  if (user) {
    return true;
  }

  // If no user in localStorage, we need to validate with backend
  // This is handled by fetchCurrentUserProfile
  return false;
};

/**
 * Gets the authentication token
 * @returns string | null
 */
export const getAuthToken = (): string | null => {
  return getToken();
};

/**
 * Clears all authentication data
 */
export const clearAuthData = (): void => {
  clearAuthStorage();
};

export default {
  fetchCurrentUserProfile,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  clearAuthData
};