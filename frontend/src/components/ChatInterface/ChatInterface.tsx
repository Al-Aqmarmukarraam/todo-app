'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ChatInput from '@/components/ChatInput/ChatInput';
import QuickActions from '@/components/QuickActions/QuickActions';
import { api } from '@/lib/auth/safeFetchWrapper';

interface ChatInterfaceProps {
  userId: number;
  userName: string;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId, userName, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when they update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now(),
        user_id: userId,
        conversation_id: currentConversationId || 0, // Use current conversation ID or 0 if not set
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Send message to backend
      const response = await api.post('/chat', {
        message: messageText,
        conversation_id: currentConversationId || undefined // Send conversation ID if available, or let backend create new
      });

      if (response.success && response.data) {
        // Update the conversation ID if it changed (first message creates conversation)
        if (response.data.conversation_id && currentConversationId !== response.data.conversation_id) {
          setCurrentConversationId(response.data.conversation_id);
        }

        const aiMessage: Message = {
          id: Date.now() + 1,
          user_id: userId,
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

  const handleQuickAction = (message: string) => {
    handleSendMessage(message);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h2>
      </div>

      {/* Quick Actions */}
      <QuickActions onQuickAction={handleQuickAction} disabled={loading} />

      {/* Messages Container */}
      <div className="border border-gray-200 rounded-lg mb-4 max-h-96 overflow-y-auto">
        <div className="p-4 min-h-64">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start a conversation by sending a message to the AI assistant.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                You can ask to create, list, update, or complete tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.role === 'user'}
                />
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center space-x-2 p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600">AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
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
    </div>
  );
};

export default ChatInterface;