'use client';

import React from 'react';

interface QuickActionsProps {
  onQuickAction: (message: string) => void;
  disabled: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction, disabled }) => {
  const quickActions = [
    { emoji: '➕', label: 'Add Task', message: 'Add a task to buy groceries' },
    { emoji: '✅', label: 'Complete Task', message: 'Mark task 1 as complete' },
    { emoji: '✏️', label: 'Update Task', message: 'Update the description of task 1' },
    { emoji: '🗑️', label: 'Delete Task', message: 'Delete task 2' },
    { emoji: '📋', label: 'Show Tasks', message: 'Show my pending tasks' },
  ];

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</h3>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onQuickAction(action.message)}
            disabled={disabled}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${
              disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer'
            }`}
          >
            <span className="mr-1">{action.emoji}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;