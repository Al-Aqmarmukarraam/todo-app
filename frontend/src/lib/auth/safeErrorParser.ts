/**
 * Safe Error Parser Utility
 * Normalizes all backend error objects into human-readable strings
 */

interface ValidationError {
  type?: string;
  loc?: Array<string | number>;
  msg?: string;
  input?: any;
}

interface BackendError {
  detail?: string | ValidationError[] | any;
  message?: string | any;
  error?: string | any;
  [key: string]: any;
}

/**
 * Safely parses backend errors and converts them to human-readable strings
 * @param error - Unknown error object from backend
 * @returns Human-readable error string
 */
export const parseBackendError = (error: unknown): string => {
  // Handle null/undefined
  if (error == null) {
    return 'Something went wrong';
  }

  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object, return its message
  if (error instanceof Error) {
    return error.message;
  }

  // Handle plain objects
  if (typeof error === 'object') {
    const backendError = error as BackendError;

    // Handle FastAPI 422 validation errors (detail is an array)
    if (Array.isArray(backendError.detail)) {
      const validationErrors = backendError.detail as ValidationError[];

      // Extract the first validation error message
      if (validationErrors.length > 0) {
        const firstError = validationErrors[0];
        if (firstError && firstError.msg) {
          return firstError.msg;
        }

        // If no msg, try to construct a meaningful error
        const location = firstError && firstError.loc ? firstError.loc.join('.') : '';
        return `Validation error${location ? ` at ${location}` : ''}: ${firstError && firstError.msg ? firstError.msg : 'Invalid input'}`;
      }

      return 'Validation failed: Multiple fields have errors';
    }

    // Handle FastAPI error with detail as string
    if (typeof backendError.detail === 'string') {
      return backendError.detail;
    }

    // Handle generic error message field
    if (typeof backendError.message === 'string') {
      return backendError.message;
    }

    // Handle generic error field
    if (typeof backendError.error === 'string') {
      return backendError.error;
    }

    // If none of the above worked, try to stringify the object
    try {
      return JSON.stringify(error);
    } catch (stringifyError) {
      // If stringifying fails, return a generic error
      return 'An error occurred';
    }
  }

  // For any other types, return a generic message
  return 'Something went wrong';
};

/**
 * Normalizes error responses from API calls
 * @param response - API response object that may contain error
 * @returns Normalized error string or null if no error
 */
export const normalizeApiError = (response: any): string | null => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  // If there's an error property, parse it
  if ('error' in response && response.error != null) {
    return parseBackendError(response.error);
  }

  // If there's a detail property, parse it
  if ('detail' in response && response.detail != null) {
    return parseBackendError(response.detail);
  }

  // If there's a message property, parse it
  if ('message' in response && response.message != null) {
    return parseBackendError(response.message);
  }

  return null;
};