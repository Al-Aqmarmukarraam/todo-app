import { User, UserCreate, Todo, TodoCreate, TodoUpdate, UserResponse } from './types';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8000';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Authentication methods
  async register(userData: UserCreate): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || 'Registration failed';
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Login failed';

      // Handle different error scenarios
      if (response.status === 401) {
        errorMessage = errorData.detail || 'Invalid email or password';
      } else if (response.status === 422) {
        errorMessage = 'Invalid input data';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getUserProfile(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to fetch user profile';

      if (response.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Task methods (aligned with backend API)
  async getTodos(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to fetch tasks';

      if (response.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async createTodo(todoData: TodoCreate): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to create task';

      if (response.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (response.status === 422) {
        errorMessage = 'Invalid task data';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateTodo(id: number, todoData: TodoUpdate): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to update task';

      if (response.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (response.status === 404) {
        errorMessage = 'Task not found';
      } else if (response.status === 422) {
        errorMessage = 'Invalid task data';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async deleteTodo(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to delete task';

      if (response.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (response.status === 404) {
        errorMessage = 'Task not found';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }
  }

  async toggleTodo(id: number): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'Failed to toggle task completion';

      if (response.status === 401) {
        errorMessage = 'Authentication required - please log in again';
      } else if (response.status === 403) {
        errorMessage = 'Access denied';
      } else if (response.status === 404) {
        errorMessage = 'Task not found';
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

}


export const apiClient = new ApiClient();