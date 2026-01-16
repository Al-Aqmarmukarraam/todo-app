// AuthForm component with login/signup modes and form validation
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/auth';
import { RegisterRequest } from '@/lib/types';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSwitchMode?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, error: authError } = useAuth();

  // Combine local form errors with auth context errors
  const combinedError = localError || authError;

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError(null);
      return true;
    }
  };

  // Username validation
  const validateUsername = (username: string): boolean => {
    if (mode === 'signup') {
      if (!username) {
        setUsernameError('Username is required');
        return false;
      } else if (username.length < 3) {
        setUsernameError('Username must be at least 3 characters');
        return false;
      } else if (username.length > 30) {
        setUsernameError('Username must be less than 30 characters');
        return false;
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError('Username can only contain letters, numbers, and underscores');
        return false;
      } else {
        setUsernameError(null);
        return true;
      }
    }
    return true; // Skip validation for login mode
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError(null);
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    let isFormValid = isEmailValid && isPasswordValid;
    if (mode === 'signup') {
      isFormValid = isFormValid && isUsernameValid;
    }

    // Additional validation for confirm password in signup mode
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        isFormValid = false;
      }
    }

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        await register(email, username, password);
      }

      // Reset form after successful submission
      if (mode === 'signup') {
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      // Error is already handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (usernameError) validateUsername(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) validatePassword(value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (localError && password === value) {
      setLocalError(null); // Clear local error if passwords match now
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login'
              ? 'Enter your credentials to access your account'
              : 'Sign up to get started with our service'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {combinedError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {combinedError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => validateEmail(email)}
                className={`block w-full px-3 py-2 mt-1 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={() => validateUsername(username)}
                  className={`block w-full px-3 py-2 mt-1 border ${
                    usernameError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="your_username"
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => validatePassword(password)}
                className={`block w-full px-3 py-2 mt-1 border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {isLoading
                ? 'Processing...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center text-gray-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchMode}
                disabled={isLoading}
                className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchMode}
                disabled={isLoading}
                className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;