// Main Authentication Context Provider - Simplified Implementation
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
  | { type: 'RESTORE_AUTH'; payload: { user: User | null; token: string | null; isAuthenticated: boolean } };

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
        token: action.payload.access_token,
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
    case 'RESTORE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: action.payload.isAuthenticated,
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

  // Restore auth state from cookies on initial load
  useEffect(() => {
    const restoreAuthState = () => {
      const token = getToken();
      const user = getUser();
      const isAuthenticated = !!token && !!user;

      dispatch({
        type: 'RESTORE_AUTH',
        payload: {
          user,
          token,
          isAuthenticated
        }
      });
    };

    restoreAuthState();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        // Store the token and user data in cookies only
        const { user, access_token, token_type } = response.data;
        setToken(access_token);
        setUser(user);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, access_token, token_type }
        });

        // Redirect to dashboard after successful login
        window.location.href = '/dashboard';
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
        // Store the token and user data in cookies only
        const { user, access_token, token_type } = response.data;
        setToken(access_token);
        setUser(user);

        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: { user, access_token, token_type }
        });

        // Redirect to dashboard after successful registration
        window.location.href = '/dashboard';
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
    // Clear the auth storage (cookies)
    clearAuthStorage();

    // Clear the auth state
    dispatch({ type: 'LOGOUT' });

    // Redirect to login page
    window.location.href = '/login';
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

// Export JWT utilities for middleware
export { verifyJWT, getJWTPayload } from '../lib/auth/jwtUtils';
