// Safe Fetch Wrapper for Protected Requests
// Handles JWT authorization, error handling, and response validation

import { getToken, clearAuthStorage } from './utils';
import { parseBackendError } from './safeErrorParser';

// Base API configuration
const API_BASE_URL = process.env['NEXT_PUBLIC_API_BASE_URL'] || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Safe fetch wrapper that handles JWT authorization and response validation
 * @param url - The URL to fetch
 * @param options - Request options
 * @returns Promise<ApiResponse>
 */
const safeFetch = async <T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  // Construct the full URL with the base URL
  const fullUrl = `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

  // Determine if this is an auth endpoint that should not require a token
  const isAuthEndpoint = url.includes('/auth/') && !url.includes('/auth/me');
  const shouldSkipAuth = options.skipAuth || isAuthEndpoint;

  // Clone the options to avoid mutating the original
  const requestOptions: RequestOptions = { ...options };

  // Set default headers if none provided
  if (!requestOptions.headers) {
    requestOptions.headers = {};
  }

  // Convert headers to a Headers object to make manipulation easier
  let headers: Headers;
  if (requestOptions.headers instanceof Headers) {
    headers = requestOptions.headers;
  } else if (Array.isArray(requestOptions.headers)) {
    headers = new Headers(requestOptions.headers);
  } else {
    headers = new Headers(requestOptions.headers);
  }

  // Add Content-Type header if not already set and we have a body
  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add Authorization header if not skipping auth and token exists
  if (!shouldSkipAuth) {
    const token = getToken();
    console.log('Token presence:', !!token); // Log token presence
    if (token && typeof token === 'string') {
      console.log('Adding Authorization header'); // Log header addition
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.log('No token to add to header'); // Log when no token
    }
    // Don't return error immediately if no token found during hydration
    // The caller should handle missing token appropriately
  }

  // Set credentials to include to ensure cookies are sent with requests
  // Only set credentials for requests that need cookie-based auth
  if (!shouldSkipAuth) {
    requestOptions.credentials = 'include';
  }

  // Replace the headers in the request options
  requestOptions.headers = headers;

  try {
    console.log('Making request to:', fullUrl); // Debug logging
    console.log('Request options:', {
      method: requestOptions.method,
      headers: Object.fromEntries(headers.entries()),
      hasBody: !!requestOptions.body
    }); // Debug logging

    const response = await fetch(fullUrl, requestOptions);
    console.log('Response status:', response.status, 'ok:', response.ok); // Debug logging

    // Handle 401/403 Unauthorized responses by clearing auth state
    if (response.status === 401 || response.status === 403) {
      // Only clear auth storage if this is not an auth endpoint
      // (Don't clear auth when trying to validate credentials)
      if (!isAuthEndpoint) {
        clearAuthStorage(); // Clear invalid token
      }
      return {
        success: false,
        error: 'Unauthorized: Please log in again'
      };
    }

    // Check if the response status indicates an error
    if (!response.ok) {
      console.log('Response not ok, status:', response.status); // Debug logging

      // Try to parse error response, but handle empty responses gracefully
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType); // Debug logging

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.log('Raw error response:', errorData); // Debug logging

          // Use the safe error parser to normalize the error
          errorMessage = parseBackendError(errorData);
        } else {
          // For non-JSON responses, try to get text
          const errorText = await response.text();
          console.log('Non-JSON error response:', errorText); // Debug logging
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status-based message
        console.warn('Could not parse error response:', parseError);
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    // Check if response has content before parsing JSON
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    console.log('Response contentLength:', contentLength, 'contentType:', contentType); // Debug logging

    if (response.status === 204 || (contentLength && contentLength === '0')) {
      return {
        success: true,
        data: undefined as T
      };
    }

    // Verify that the response contains JSON before parsing
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: `Invalid response format: expected JSON, got ${contentType || 'unknown'}`
      };
    }

    // Safely parse the JSON response
    let responseData: T;
    try {
      responseData = await response.json();
      console.log('Successful response data:', responseData); // Debug logging
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        success: false,
        error: 'Invalid JSON response from server'
      };
    }

    return {
      success: true,
      data: responseData
    };

  } catch (error) {
    // Handle network errors or other unexpected errors
    console.error('Network error in safeFetch:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to reach server'
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during fetch'
    };
  }
};

/**
 * Convenience methods for common HTTP operations
 */
const api = {
  get: <T = any>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> =>
    safeFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> =>
    safeFetch<T>(url, {
      ...options,
      method: 'POST',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  put: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> =>
    safeFetch<T>(url, {
      ...options,
      method: 'PUT',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  patch: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> =>
    safeFetch<T>(url, {
      ...options,
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  delete: <T = any>(url: string, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> =>
    safeFetch<T>(url, { ...options, method: 'DELETE' }),
};

export { safeFetch, api };
export default api;