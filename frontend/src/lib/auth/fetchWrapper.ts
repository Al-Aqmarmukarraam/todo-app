// Fetch wrapper with automatic JWT handling and 401 error management
// Automatically attaches Authorization header and handles 401 responses by logging out the user

import { getAuthToken, handleUnauthorized } from './auth';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

const authFetch = async (url: string, options: RequestOptions = {}): Promise<Response> => {
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
  if (!requestOptions.skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Replace the headers in the request options
  requestOptions.headers = headers;

  try {
    const response = await fetch(url, requestOptions);

    // Handle 401 responses by clearing auth state and redirecting
    if (response.status === 401) {
      handleUnauthorized();

      // Optionally, redirect to login page (you may want to use router here)
      // window.location.href = '/login';
    }

    return response;
  } catch (error) {
    console.error('Network error in authFetch:', error);
    throw error;
  }
};

// Convenience methods for common HTTP operations
const api = {
  get: (url: string, options?: Omit<RequestOptions, 'method'>) =>
    authFetch(url, { ...options, method: 'GET' }),

  post: (url: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    authFetch(url, {
      ...options,
      method: 'POST',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  put: (url: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    authFetch(url, {
      ...options,
      method: 'PUT',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  patch: (url: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    authFetch(url, {
      ...options,
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),

  delete: (url: string, options?: Omit<RequestOptions, 'method'>) =>
    authFetch(url, { ...options, method: 'DELETE' }),
};

export { authFetch, api };
export default api;