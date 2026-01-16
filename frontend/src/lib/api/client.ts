// Centralized API client for all backend communications
'use client';

import { getToken, isAuthenticated, clearAuthStorage } from '../auth/utils';

// Base API configuration
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000/api';

// Define API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

// Define task interface based on specifications
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Define user interface
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

// Define authentication response
export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

// Centralized API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
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

  // Generic request method
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
        // Import the handleUnauthorized function - in a real implementation, we would need to call it
        // For now, we'll just return an error indicating unauthorized access
        clearAuthStorage(); // Clear auth storage when 401 received

        return {
          data: undefined as T,
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
        return {
          data: undefined as T,
          success: false,
          error: data.error || `HTTP Error: ${response.status}`,
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        data: undefined as T,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      return {
        data: undefined as unknown as AuthResponse,
        success: false,
        error: errorData.error || `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      data,
      success: true,
    };
  }

  async register(email: string, username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
      return {
        data: undefined as unknown as AuthResponse,
        success: false,
        error: errorData.error || `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      data,
      success: true,
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    // Note: Backend might not have a logout endpoint that invalidates JWTs server-side
    // Since JWTs are stateless, we just clear the client-side token
    return {
      data: undefined,
      success: true,
    };
  }

  // Todo methods
  async getTodos(): Promise<ApiResponse<any[]>> {
    // Get user profile to get the current user ID
    const userResponse = await this.getUserProfile();
    if (!userResponse.success || !userResponse.data) {
      return {
        data: undefined as any[],
        success: false,
        error: userResponse.error || 'Failed to get user profile'
      };
    }

    const userId = userResponse.data.id;
    return this.request<any[]>(`/${userId}/todos`);
  }

  async getTodo(todoId: number): Promise<ApiResponse<any>> {
    // Get user profile to get the current user ID
    const userResponse = await this.getUserProfile();
    if (!userResponse.success || !userResponse.data) {
      return {
        data: undefined as any,
        success: false,
        error: userResponse.error || 'Failed to get user profile'
      };
    }

    const userId = userResponse.data.id;
    return this.request<any>(`/${userId}/todos/${todoId}`);
  }

  async createTodo(todoData: any): Promise<ApiResponse<any>> {
    // Get user profile to get the current user ID
    const userResponse = await this.getUserProfile();
    if (!userResponse.success || !userResponse.data) {
      return {
        data: undefined as any,
        success: false,
        error: userResponse.error || 'Failed to get user profile'
      };
    }

    const userId = userResponse.data.id;
    return this.request<any>(`/${userId}/todos`, {
      method: 'POST',
      body: JSON.stringify(todoData),
    });
  }

  async updateTodo(todoId: number, todoData: any): Promise<ApiResponse<any>> {
    // Get user profile to get the current user ID
    const userResponse = await this.getUserProfile();
    if (!userResponse.success || !userResponse.data) {
      return {
        data: undefined as any,
        success: false,
        error: userResponse.error || 'Failed to get user profile'
      };
    }

    const userId = userResponse.data.id;
    return this.request<any>(`/${userId}/todos/${todoId}`, {
      method: 'PUT',
      body: JSON.stringify(todoData),
    });
  }

  async deleteTodo(todoId: number): Promise<ApiResponse<void>> {
    // Get user profile to get the current user ID
    const userResponse = await this.getUserProfile();
    if (!userResponse.success || !userResponse.data) {
      return {
        data: undefined,
        success: false,
        error: userResponse.error || 'Failed to get user profile'
      };
    }

    const userId = userResponse.data.id;
    return this.request<void>(`/${userId}/todos/${todoId}`, {
      method: 'DELETE',
    });
  }

  async toggleTodoCompletion(todoId: number, completed: boolean): Promise<ApiResponse<any>> {
    // Get user profile to get the current user ID
    const userResponse = await this.getUserProfile();
    if (!userResponse.success || !userResponse.data) {
      return {
        data: undefined as any,
        success: false,
        error: userResponse.error || 'Failed to get user profile'
      };
    }

    const userId = userResponse.data.id;
    return this.request<any>(`/${userId}/todos/${todoId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  // Task methods (keeping for backward compatibility)
  async getTasks(userId: string): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>(`/${userId}/tasks`);
  }

  async getTask(userId: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/${userId}/tasks/${taskId}`);
  }

  async createTask(userId: string, taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(userId: string, taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(userId: string, taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletionOld(userId: string, taskId: string, completed: boolean): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<User>> {
    const token = getToken();
    if (!token) {
      return {
        data: undefined as unknown as User,
        success: false,
        error: 'No authentication token found',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if the response status indicates an error
      if (!response.ok) {
        // Handle different error statuses appropriately
        if (response.status === 401 || response.status === 403) {
          // Clear auth storage if unauthorized
          clearAuthStorage();
          return {
            data: undefined as unknown as User,
            success: false,
            error: 'Unauthorized: Please log in again',
          };
        }

        // Try to parse error response, but handle empty responses gracefully
        let errorData;
        try {
          // Check if response has content before parsing
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            // If not JSON, use status text or default error message
            errorData = { error: `HTTP Error: ${response.status} ${response.statusText}` };
          }
        } catch (parseError) {
          // If we can't parse the error response, use default message
          errorData = { error: `HTTP Error: ${response.status}` };
        }

        return {
          data: undefined as unknown as User,
          success: false,
          error: errorData.error || `HTTP Error: ${response.status}`,
        };
      }

      // Handle different response types and check if response has content
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {
          data: undefined as unknown as User,
          success: false,
          error: 'Empty response received from server',
        };
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          data: undefined as unknown as User,
          success: false,
          error: 'Invalid response format from server',
        };
      }

      // Safely parse the JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        return {
          data: undefined as unknown as User,
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
      // If it's a network error, the connection might be down
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          data: undefined as unknown as User,
          success: false,
          error: 'Network error: Unable to reach server',
        };
      }

      return {
        data: undefined as unknown as User,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

// Create a singleton instance of the API client
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletionOld,
  getUserProfile,
} = apiClient;

export default apiClient;