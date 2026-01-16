// Authentication Context for React state management
'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { apiClient, AuthResponse, User } from '@/lib/api/client';
import { setToken, setUser, clearAuthStorage, getToken, getUser } from './utils';

// Define the authentication state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  | { type: 'CHECK_AUTH_STATUS_FAILURE' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
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
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
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
        error: null,
      };
    case 'CHECK_AUTH_STATUS_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create the AuthContext
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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

        if (!token) {
          // No token, user is not authenticated
          dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
          return;
        }

        // Check if token is still valid by attempting to get user profile
        const response = await apiClient.getUserProfile();

        if (response.success && response.data) {
          // Update user in state and storage
          setUser(response.data);
          dispatch({
            type: 'CHECK_AUTH_STATUS_SUCCESS',
            payload: response.data
          });
        } else {
          // Token is invalid or expired, clear auth state
          clearAuthStorage();
          dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
        }
      } catch (error) {
        // Error occurred, clear auth state
        clearAuthStorage();
        dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
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
        const { user, token } = response.data;
        setToken(token);
        setUser(user);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: response.data
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.error || 'Login failed'
        });
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const response = await apiClient.register(email, password);

      if (response.success && response.data) {
        // Store the token and user data
        const { user, token } = response.data;
        setToken(token);
        setUser(user);

        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: response.data
        });
      } else {
        dispatch({
          type: 'REGISTER_FAILURE',
          payload: response.error || 'Registration failed'
        });
      }
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed'
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