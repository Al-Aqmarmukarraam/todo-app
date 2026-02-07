// Centralized API client for all backend communications
'use client';

import { getToken, isAuthenticated, clearAuthStorage } from '../auth/utils';
import { parseBackendError } from '../auth/safeErrorParser';

// Base API configuration
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:8000';

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
        // Use the safe error parser to normalize the error
        const errorMessage = parseBackendError(data);
        return {
          data: undefined as T,
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
        data: undefined as T,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      // Use the safe error parser to normalize the error
      const errorMessage = parseBackendError(errorData);
      return {
        data: undefined as unknown as AuthResponse,
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

  async register(email: string, username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
      // Use the safe error parser to normalize the error
      const errorMessage = parseBackendError(errorData);
      return {
        data: undefined as unknown as AuthResponse,
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

  async logout(): Promise<ApiResponse<void>> {
    // Note: Backend might not have a logout endpoint that invalidates JWTs server-side
    // Since JWTs are stateless, we just clear the client-side token
    return {
      data: undefined,
      success: true,
    };
  }

  // Todo methods - Updated to use new route pattern without userId in URL
  async getTodos(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/tasks');  // Using tasks endpoint since they're the same now
  }

  async getTodo(todoId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/tasks/${todoId}`);  // Using tasks endpoint
  }

  async createTodo(todoData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/tasks', {  // Using tasks endpoint
      method: 'POST',
      body: JSON.stringify(todoData),
    });
  }

  async updateTodo(todoId: number, todoData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/tasks/${todoId}`, {  // Using tasks endpoint
      method: 'PUT',
      body: JSON.stringify(todoData),
    });
  }

  async deleteTodo(todoId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${todoId}`, {  // Using tasks endpoint
      method: 'DELETE',
    });
  }

  async toggleTodoCompletion(todoId: number, completed: boolean): Promise<ApiResponse<any>> {
    return this.request<any>(`/tasks/${todoId}/complete`, {  // Using tasks endpoint
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  // Task methods (using new route pattern without userId in URL)
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/tasks');
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}`);
  }

  async createTask(taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  // Chat methods
  async chat(message: string, conversationId?: number): Promise<ApiResponse<any>> {
    return this.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  }

  async getConversations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/chat/conversations');
  }

  async getConversationHistory(conversationId: number): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/chat/conversations/${conversationId}`);
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<User>> {
    const token = getToken();
    if (!token) {
      // Return a more specific error that can be handled differently by auth context
      return {
        data: undefined as unknown as User,
        success: false,
        error: 'NO_TOKEN_FOUND',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
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
            error: 'UNAUTHORIZED',
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

        // Use the safe error parser to normalize the error
        const errorMessage = parseBackendError(errorData);
        return {
          data: undefined as unknown as User,
          success: false,
          error: errorMessage,
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

      // Use the safe error parser to normalize the error
      const errorMessage = parseBackendError(error);
      return {
        data: undefined as unknown as User,
        success: false,
        error: errorMessage,
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
  toggleTaskCompletion,
  chat,
  getConversations,
  getConversationHistory,
  getUserProfile,
} = apiClient;

export default apiClient;