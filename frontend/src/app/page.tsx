'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/safeFetchWrapper';
import { Message } from '@/lib/types';
import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ChatInput from '@/components/ChatInput/ChatInput';
import QuickActions from '@/components/QuickActions/QuickActions';

const HomePage = () => {
  const { user: authUser, isLoading: authLoading, isHydrated, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when they update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Wait for auth hydration to complete before showing content
  useEffect(() => {
    if (!isHydrated) {
      return; // Still hydrating, don't do anything yet
    }

    // If not authenticated after hydration, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleSendMessage = async (messageText: string) => {
    if (!authUser || !messageText.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now(),
        conversation_id: 1, // This would come from the actual conversation
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Send message to backend
      const response = await api.post('/chat', {
        message: messageText,
        conversation_id: 1 // This would be the actual conversation ID
      });

      if (response.success && response.data) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          conversation_id: response.data.conversation_id,
          role: 'assistant',
          content: response.data.response,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(response.error || 'Failed to get response from AI');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading state while auth is loading or auth is not hydrated
  if (authLoading || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after hydration, show access denied message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Todo AI Chatbot</h1>
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
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4">
        {/* Quick Actions */}
        <div className="mb-4">
          <QuickActions
            onQuickAction={handleSendMessage}
            disabled={loading}
          />
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[calc(100vh-250px)]">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start a conversation by sending a message to the AI chatbot.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                You can ask to create, list, update, or complete tasks.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwnMessage={message.role === 'user'}
              />
            ))
          )}
          {loading && (
            <div className="flex items-center space-x-2 p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600">AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </main>
    </div>
  );
};

export default HomePage;