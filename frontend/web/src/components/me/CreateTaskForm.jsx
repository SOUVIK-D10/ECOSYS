import React, { useState } from 'react';
import { createTask } from '../../hooks/api.js';

// Priority Mapping corresponding to TaskPriority enum
const PRIORITY_OPTIONS = [
  { label: 'UNIDENTIFIED (0)', value: 0 },
  { label: 'LOW (1)', value: 1 },
  { label: 'MEDIUM (2)', value: 2 },
  { label: 'HIGH (3)', value: 3 },
  { label: 'CRITICAL (4)', value: 4 },
];

export default function CreateTaskForm({ projectId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 0,
    assignee: 'UNKNOWN',
    project_id: projectId ? Number(projectId) : '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' || name === 'project_id' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (!formData.project_id) {
      setError('Project ID is required.');
      return;
    }

    // Construct CreateTaskDTO payload
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      priority: formData.priority,
      assignee: formData.assignee.trim() || 'UNKNOWN',
      project_id: Number(formData.project_id),
    };

    try {
      setIsSubmitting(true);
      const createdTask = await createTask(payload);
      if (onSuccess) {
        onSuccess(createdTask);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err?.response?.data?.detail || 'Failed to initialize task entity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-lg p-6 font-mono text-gray-200 max-w-xl w-full">
      {/* Header */}
      <div className="border-b border-gray-800 pb-3 mb-5 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-[#00ffaa] tracking-widest uppercase">
            // QUEUE INGESTION
          </span>
          <h2 className="text-lg font-bold tracking-wider text-gray-100">
            INITIALIZE NEW TASK
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-red-400 text-sm transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error Output */}
      {error && (
        <div className="mb-4 text-xs text-red-400 border border-red-900/50 p-3 rounded bg-red-950/20">
          ERR: {error}
        </div>
      )}

      {/* Form Controls */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block text-gray-400 uppercase tracking-wider mb-1">
            Task Title <span className="text-[#00ffaa]">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Deploy STOMP Telemetry Service"
            required
            className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-400 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter operational parameters or notes..."
            className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] transition-colors resize-none"
          />
        </div>

        {/* Row 1: Priority & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 uppercase tracking-wider mb-1">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] transition-colors cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 uppercase tracking-wider mb-1">
              Assignee
            </label>
            <input
              type="text"
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              placeholder="UNKNOWN"
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Project ID & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 uppercase tracking-wider mb-1">
              Project ID <span className="text-[#00ffaa]">*</span>
            </label>
            <input
              type="number"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              placeholder="1"
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] transition-colors"
              disabled={!!projectId}
            />
          </div>

          <div>
            <label className="block text-gray-400 uppercase tracking-wider mb-1">
              Deadline
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] transition-colors color-scheme-dark"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-800 text-gray-400 hover:text-gray-200 rounded transition-colors"
            >
              CANCEL
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#00ffaa]/10 border border-[#00ffaa]/50 hover:bg-[#00ffaa]/20 text-[#00ffaa] font-semibold rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'INGESTING...' : 'DISPATCH TASK'}
          </button>
        </div>
      </form>
    </div>
  );
}