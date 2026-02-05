'use client';

import React, { useState, useEffect } from 'react';
import { Todo, TodoUpdate } from '@/lib/types';

interface UpdateTaskFormProps {
  task: Todo; // Required for editing an existing task
  onUpdate: (task: TodoUpdate) => void;
  onCancel: () => void;
}

const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({ task, onUpdate, onCancel }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [completed, setCompleted] = useState(task.completed);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update local state when task prop changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setCompleted(task.completed);
    setErrors({});
  }, [task]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors['title'] = 'Title is required';
    }

    if (title.length > 255) {
      newErrors['title'] = 'Title must be less than 255 characters';
    }

    if (description && description.length > 1000) {
      newErrors['description'] = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const updatedTask: TodoUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed
    };

    onUpdate(updatedTask);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Edit Task
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors['title'] ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Task title"
          />
          {errors['title'] && (
            <p className="mt-1 text-sm text-red-600">{errors['title']}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors['description'] ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Task description (optional)"
          />
          {errors['description'] && (
            <p className="mt-1 text-sm text-red-600">{errors['description']}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="completed"
            name="completed"
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
            Completed
          </label>
        </div>

        {errors['general'] && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{errors['general']}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Task
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTaskForm;