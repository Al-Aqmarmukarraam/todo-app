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