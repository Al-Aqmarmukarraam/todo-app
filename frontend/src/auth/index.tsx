// Main Authentication Context Provider - Updated Implementation
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { apiClient, AuthResponse, User } from '../lib/api/client';
import { setToken, setUser, clearAuthStorage, getToken, getUser } from '../lib/auth/utils';
import { parseBackendError } from '../lib/auth/safeErrorParser';

// Define the authentication state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // Added to track when auth state has been restored
  error: string | null;
}

// Define the actions for the auth reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: AuthResponse }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CHECK_AUTH_STATUS_START' }
  | { type: 'CHECK_AUTH_STATUS_SUCCESS'; payload: User }
  | { type: 'CHECK_AUTH_STATUS_FAILURE' }
  | { type: 'AUTH_HYDRATION_COMPLETE' }; // Added for hydration

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Changed to true initially to indicate auth is being checked
  isHydrated: false, // Added to track hydration state
  error: null,
};

// Auth reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true, // Mark as hydrated after successful login/register
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true, // Mark as hydrated even after failure
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true, // Mark as hydrated after logout
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CHECK_AUTH_STATUS_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'CHECK_AUTH_STATUS_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true, // Mark as hydrated after checking auth status
        error: null,
      };
    case 'CHECK_AUTH_STATUS_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true, // Mark as hydrated after checking auth status
      };
    case 'AUTH_HYDRATION_COMPLETE':
      return {
        ...state,
        isHydrated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create the AuthContext
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      dispatch({ type: 'CHECK_AUTH_STATUS_START' });

      try {
        // Check if we have a stored token
        const token = getToken();
        console.log('Auth restoration - token exists:', !!token);

        if (!token) {
          // No token, user is not authenticated
          console.log('No token found during auth restoration');
          dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
          dispatch({ type: 'AUTH_HYDRATION_COMPLETE' });
          return;
        }

        // Check if token is still valid by attempting to get user profile
        console.log('Attempting to validate token with user profile fetch');
        const response = await apiClient.getUserProfile();

        console.log('User profile response during auth restoration:', response);

        if (response.success && response.data) {
          // Update user in state and storage
          setUser(response.data);
          console.log('Token validation successful during auth restoration');
          dispatch({
            type: 'CHECK_AUTH_STATUS_SUCCESS',
            payload: response.data
          });
        } else if (response.error === 'NO_TOKEN_FOUND' || response.error === 'UNAUTHORIZED') {
          // Token is invalid or expired, clear auth state
          console.log('Token validation failed during auth restoration - clearing storage');
          clearAuthStorage();
          dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
        } else {
          // For other errors (like network errors), don't clear the token as it might be a temporary issue
          console.log('Non-auth error during auth restoration - keeping token', response.error);
          dispatch({
            type: 'CHECK_AUTH_STATUS_SUCCESS',
            payload: getUser() // Use cached user if available
          });
        }
      } catch (error) {
        // For catch-all errors (like network issues), don't clear the token as it might be a temporary issue
        console.error('Error during auth restoration - keeping token:', error);
        dispatch({
          type: 'CHECK_AUTH_STATUS_SUCCESS',
          payload: getUser() // Use cached user if available
        });
      } finally {
        dispatch({ type: 'AUTH_HYDRATION_COMPLETE' });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        // Store the token and user data
        const { user, access_token } = response.data;
        console.log('Storing token after login:', access_token.substring(0, 20) + '...');
        setToken(access_token);
        setUser(user);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: access_token }
        });
      } else {
        // Use the safe error parser to normalize the error
        const errorMessage = response.error ? parseBackendError(response.error) : 'Login failed';
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: errorMessage
        });
      }
    } catch (error) {
      // Use the safe error parser to normalize the error
      const errorMessage = parseBackendError(error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
    }
  };

  // Register function
  const register = async (email: string, username: string, password: string) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const response = await apiClient.register(email, username, password);

      if (response.success && response.data) {
        // Store the token and user data
        const { user, access_token } = response.data;
        console.log('Storing token after registration:', access_token.substring(0, 20) + '...');
        setToken(access_token);
        setUser(user);

        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: { user, token: access_token }
        });
      } else {
        // Use the safe error parser to normalize the error
        const errorMessage = response.error ? parseBackendError(response.error) : 'Registration failed';
        dispatch({
          type: 'REGISTER_FAILURE',
          payload: errorMessage
        });
      }
    } catch (error) {
      // Use the safe error parser to normalize the error
      const errorMessage = parseBackendError(error);
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: errorMessage
      });
    }
  };

  // Logout function
  const logout = () => {
    // Clear the auth storage
    clearAuthStorage();

    // Clear the auth state
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Higher-order component to wrap components that require authentication
export const withAuth = (Component: React.ComponentType) => {
  return () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      // Redirect to login page - in a real app you might use Next.js router
      return <div>Please log in to access this page.</div>;
    }

    return <Component />;
  };
};