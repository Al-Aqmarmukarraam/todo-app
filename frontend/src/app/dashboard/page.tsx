'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/safeFetchWrapper'; // Use the new safe fetch wrapper
import { Todo, TodoCreate, TodoUpdate } from '@/lib/types';
import TaskForm from '@/components/TaskForm/TaskForm';
import TaskCard from '@/components/TaskCard/TaskCard';
import { fetchCurrentUserProfile, getCurrentUser } from '@/lib/auth/safeAuth'; // Import safe auth functions

const DashboardPage: React.FC = () => {
  const { user: authUser, isLoading: authLoading, logout, isAuthenticated: isAuthContextReady } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); // Store the fetched user
  const [userFetchLoading, setUserFetchLoading] = useState(true); // Loading state for user fetch

  // Effect to redirect if not authenticated in auth context
  useEffect(() => {
    if (!authLoading && !isAuthContextReady) {
      router.push('/login');
    }
  }, [isAuthContextReady, authLoading, router]);

  // Effect to fetch current user using the safe auth function
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // First, try to get user from localStorage (faster)
        const localUser = getCurrentUser();
        if (localUser) {
          setCurrentUser(localUser);
          setUserFetchLoading(false);

          // Still fetch from server in background to validate token
          setTimeout(async () => {
            const serverResponse = await fetchCurrentUserProfile();
            if (serverResponse.success && serverResponse.data) {
              // Update user data with fresh data from server
              localStorage.setItem('user', JSON.stringify(serverResponse.data));
              setCurrentUser(serverResponse.data);
            } else if (serverResponse.error?.includes('Unauthorized')) {
              // If unauthorized, log out and redirect
              logout();
              router.push('/login');
            }
          }, 0);
        } else {
          // If no user in localStorage, fetch from server
          const response = await fetchCurrentUserProfile();

          if (response.success && response.data) {
            // Store user in localStorage for future quick access
            localStorage.setItem('user', JSON.stringify(response.data));
            setCurrentUser(response.data);
          } else if (response.error?.includes('Unauthorized')) {
            // If unauthorized, log out and redirect
            logout();
            router.push('/login');
            return;
          } else {
            setError(response.error || 'Failed to load user profile');
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching user:', err);
        setError('An unexpected error occurred while loading user profile');
      } finally {
        setUserFetchLoading(false);
      }
    };

    // Only fetch user if auth context is ready
    if (isAuthContextReady) {
      fetchCurrentUser();
    } else {
      setUserFetchLoading(false);
    }
  }, [isAuthContextReady, logout, router]);

  // Effect to fetch todos when user is loaded
  useEffect(() => {
    if (isAuthContextReady && currentUser) {
      fetchTodos();
    }
  }, [isAuthContextReady, currentUser]);

  const fetchTodos = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      // Use the safe fetch wrapper instead of apiClient
      const response = await api.get(`/user/${currentUser.id}/todos`);

      if (response.success && response.data) {
        setTodos(response.data as any[]);
      } else {
        setError(response.error || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TodoCreate) => {
    try {
      // Use the safe fetch wrapper instead of apiClient
      const response = await api.post(`/user/${currentUser.id}/todos`, taskData);

      if (response.success && response.data) {
        setTodos([...todos, response.data as any]);
        setShowTaskForm(false);
      } else {
        setError(response.error || 'Failed to create task');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (updatedTask: Todo) => {
    try {
      // Use the safe fetch wrapper instead of apiClient
      const response = await api.put(`/user/${currentUser.id}/todos/${updatedTask.id}`, {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed
      });

      if (response.success && response.data) {
        // Update the local state
        setTodos(todos.map(todo =>
          todo.id === updatedTask.id ? response.data : todo
        ));
      } else {
        setError(response.error || 'Failed to update task');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      // Use the safe fetch wrapper instead of apiClient
      const response = await api.delete(`/user/${currentUser.id}/todos/${taskId}`);

      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== taskId));
      } else {
        setError(response.error || 'Failed to delete task');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      // Find the current todo to get its completed status
      const currentTodo = todos.find(t => t.id === taskId);
      if (!currentTodo) return;

      const newCompletedStatus = !currentTodo.completed;

      // Use the safe fetch wrapper instead of apiClient
      const response = await api.patch(`/user/${currentUser.id}/todos/${taskId}/complete`, {
        completed: newCompletedStatus
      });

      if (response.success && response.data) {
        setTodos(todos.map(todo =>
          todo.id === taskId ? response.data : todo
        ));
      } else {
        setError(response.error || 'Failed to update task');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  // Show loading state while auth is loading or user is being fetched
  if (authLoading || userFetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated or user fetch failed
  if (!isAuthContextReady || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
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
              <span className="text-gray-700">Welcome, {currentUser.username}</span>
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
                  userId={currentUser.id}
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
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </div>
  );
};

export default DashboardPage;