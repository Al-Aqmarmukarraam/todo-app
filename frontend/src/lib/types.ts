export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string; // ISO string format from database
  updated_at: string; // ISO string format from database
  is_active: boolean;
  password_hash?: string; // Only for backend use
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: string; // ISO string format from database
  updated_at: string; // ISO string format from database
}

export interface TodoCreate {
  title: string;
  description?: string;
  completed?: boolean;
  user_id: number;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// New types for Todo AI Chatbot
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'ai';
  content: string;
  timestamp: string;
  user_id: number;
  metadata?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
  metadata: {
    user_id: number;
  };
}