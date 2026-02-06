'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/safeFetchWrapper'; // Use the new safe fetch wrapper
import { Todo, TodoCreate, TodoUpdate } from '@/lib/types';
import TaskForm from '@/components/TaskForm/TaskForm';
import TaskCard from '@/components/TaskCard/TaskCard';
import { parseBackendError } from '@/lib/auth/safeErrorParser';
import ChatInterface from '@/components/ChatInterface/ChatInterface';

const DashboardPage: React.FC = () => {
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Effect to fetch todos when user is loaded
  useEffect(() => {
    if (authUser) {
      fetchTodos();
    }
  }, [authUser]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      // Use the safe fetch wrapper - backend expects user identification from JWT cookie
      const response = await api.get('/tasks');

      if (response.success && response.data) {
        setTodos(response.data as any[]);
      } else {
        const errorMessage = response.error ? parseBackendError(response.error) : 'Failed to fetch tasks';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = parseBackendError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TodoCreate | TodoUpdate) => {
    // Create task data excluding user_id since it's derived from the JWT token on the backend
    const { user_id, ...taskDataWithoutUserId } = taskData as any;

    // Ensure we have a TaskCreate-compatible object when creating
    const createTaskData: any = {
      title: ('title' in taskDataWithoutUserId && typeof taskDataWithoutUserId.title === 'string') ? taskDataWithoutUserId.title : '',
      ...(taskDataWithoutUserId && 'description' in taskDataWithoutUserId && taskDataWithoutUserId.description !== undefined ? { description: taskDataWithoutUserId.description } : {}),
      priority: 'medium', // Default priority for new tasks
      completed: ('completed' in taskDataWithoutUserId && typeof taskDataWithoutUserId.completed === 'boolean') ? taskDataWithoutUserId.completed : false
    };

    try {
      // Use the safe fetch wrapper - backend expects user identification from JWT
      const response = await api.post('/tasks', createTaskData);

      if (response.success && response.data) {
        setTodos([...todos, response.data as any]);
        setShowTaskForm(false);
      } else {
        const errorMessage = response.error ? parseBackendError(response.error) : 'Failed to create task';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = parseBackendError(err);
      setError(errorMessage);
    }
  };

  const handleUpdateTask = async (updatedTask: Todo) => {
    // Create update data excluding user_id since it's derived from the JWT token on the backend
    const { id, created_at, updated_at, ...updateData } = updatedTask;

    try {
      // Use the safe fetch wrapper - backend expects user identification from JWT cookie
      const response = await api.put(`/tasks/${id}`, updateData);

      if (response.success && response.data) {
        // Update the local state
        setTodos(todos.map(todo =>
          todo.id === id ? response.data : todo
        ));
      } else {
        const errorMessage = response.error ? parseBackendError(response.error) : 'Failed to update task';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = parseBackendError(err);
      setError(errorMessage);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      // Use the safe fetch wrapper - backend expects user identification from JWT cookie
      const response = await api.delete(`/tasks/${taskId}`);

      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== taskId));
      } else {
        const errorMessage = response.error ? parseBackendError(response.error) : 'Failed to delete task';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = parseBackendError(err);
      setError(errorMessage);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      // Find the current todo to get its completed status
      const currentTodo = todos.find(t => t.id === taskId);
      if (!currentTodo) return;

      const newCompletedStatus = !currentTodo.completed;

      // Use the safe fetch wrapper - backend expects user identification from JWT cookie
      const response = await api.patch(`/tasks/${taskId}/complete`, {
        completed: newCompletedStatus
      });

      if (response.success && response.data) {
        setTodos(todos.map(todo =>
          todo.id === taskId ? response.data : todo
        ));
      } else {
        const errorMessage = response.error ? parseBackendError(response.error) : 'Failed to update task';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = parseBackendError(err);
      setError(errorMessage);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, the middleware should have redirected us to login
  // So we assume user is authenticated at this point
  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Todo Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {authUser?.username}</span>
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Task Management */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showTaskForm ? 'Cancel' : 'Add New Task'}
                </button>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {showTaskForm && (
                <div className="mb-6">
                  <TaskForm
                    onSave={handleCreateTask}
                    onCancel={() => setShowTaskForm(false)}
                    userId={authUser?.id}
                  />
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div>
                  {todos.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new task.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-1">
                      {todos.map((todo) => (
                        <TaskCard
                          key={todo.id}
                          task={todo}
                          onUpdate={handleUpdateTask}
                          onDelete={handleDeleteTask}
                          onToggle={handleToggleTask}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - AI Chat Interface */}
          <div className="px-4 py-6 sm:px-0">
            <ChatInterface
              userId={authUser?.id || 0}
              userName={authUser?.username || ''}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;