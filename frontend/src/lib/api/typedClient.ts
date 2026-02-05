'use client';

import { getToken, clearAuthStorage } from '../auth/utils';
import { parseBackendError } from '../auth/safeErrorParser';
import { Todo, TodoCreate, TodoUpdate, User, JWTPayload } from '../types';

// Define standardized API response types
export interface ApiSuccess<T> {
  data: T;
  success: true;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Centralized API client class with proper typing
class TypedApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:8000/api') {
    this.baseUrl = baseUrl;
  }

  // Helper method to get headers with JWT token
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get the JWT token from storage
    const token = getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method with proper typing
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      ...(options.headers || {}),
      ...(await this.getAuthHeaders()),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized responses by clearing auth state
      if (response.status === 401) {
        clearAuthStorage(); // Clear auth storage when 401 received

        return {
          success: false,
          error: 'Unauthorized: Please log in again',
        };
      }

      // Handle non-JSON responses (like 204 No Content)
      if (response.status === 204) {
        return {
          data: undefined as T,
          success: true,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        // Use the safe error parser to normalize the error
        const errorMessage = parseBackendError(data);
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; access_token: string; token_type: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      const errorMessage = parseBackendError(errorData);
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      data,
      success: true,
    };
  }

  async register(email: string, username: string, password: string): Promise<ApiResponse<{ user: User; access_token: string; token_type: string }>> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
      const errorMessage = parseBackendError(errorData);
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    return {
      data,
      success: true,
    };
  }

  // Todo methods with proper typing
  async getTodos(userId: number): Promise<ApiResponse<Todo[]>> {
    return this.request<Todo[]>(`/users/${userId}/todos`);
  }

  async getTodo(userId: number, todoId: number): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/users/${userId}/todos/${todoId}`);
  }

  async createTodo(userId: number, todoData: TodoCreate): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/users/${userId}/todos`, {
      method: 'POST',
      body: JSON.stringify(todoData),
    });
  }

  async updateTodo(userId: number, todoId: number, todoData: TodoUpdate): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/users/${userId}/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify(todoData),
    });
  }

  async deleteTodo(userId: number, todoId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}/todos/${todoId}`, {
      method: 'DELETE',
    });
  }

  async toggleTodoCompletion(userId: number, todoId: number, completed: boolean): Promise<ApiResponse<Todo>> {
    return this.request<Todo>(`/users/${userId}/todos/${todoId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<User>> {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        error: 'NO_TOKEN_FOUND',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearAuthStorage();
          return {
            success: false,
            error: 'UNAUTHORIZED',
          };
        }

        let errorData;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorData = { error: `HTTP Error: ${response.status} ${response.statusText}` };
          }
        } catch (parseError) {
          errorData = { error: `HTTP Error: ${response.status}` };
        }

        const errorMessage = parseBackendError(errorData);
        return {
          success: false,
          error: errorMessage,
        };
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {
          success: false,
          error: 'Empty response received from server',
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          error: 'Invalid response format from server',
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        return {
          success: false,
          error: 'Invalid JSON response from server',
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error: Unable to reach server',
        };
      }

      const errorMessage = parseBackendError(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

// Create a singleton instance of the typed API client
export const typedApiClient = new TypedApiClient();

// Export individual methods for convenience
export const {
  login,
  register,
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  getUserProfile,
} = typedApiClient;

export default typedApiClient;