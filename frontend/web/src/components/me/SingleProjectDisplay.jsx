import React, { useState, useEffect } from 'react';
import { fetchProjectById, updateProject, deleteProject, updateProjectState, assignTagToProject } from '../../hooks/api.js';
import { TaskCard } from './BasicCard.jsx';
import SingleTaskDisplay from './SingleTaskDisplay.jsx';
import CreateTaskForm from '../me/CreateTaskForm.jsx';
import {TagManager} from './TagManager.jsx';

const PRIORITY_OPTIONS = [
  { label: 'UNIDENTIFIED (0)', value: 0 },
  { label: 'LOW (1)', value: 1 },
  { label: 'MEDIUM (2)', value: 2 },
  { label: 'HIGH (3)', value: 3 },
  { label: 'CRITICAL (4)', value: 4 },
];

const SingleProjectDisplay = ({ projectSummary, onClose, onProjectUpdated, onProjectDeleted }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 0,
    assignee: 'UNKNOWN',
    deadline: '',
  });

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (!projectSummary?.id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchProjectById(projectSummary.id);
        if (isMounted) {
          setProjectDetails(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching project details:", err);
          setError("FAILED TO FETCH DETAILED TELEMETRY");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (projectSummary?.id) {
      loadDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [projectSummary]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isModalOpen) {
          event.stopImmediatePropagation();
          event.preventDefault();
          setIsModalOpen(false);
          return;
        }
        if (isEditing) {
          event.stopImmediatePropagation();
          event.preventDefault();
          setIsEditing(false);
          return;
        }
        if (selectedTask) {
          return; // Let SingleTaskDisplay handle its own ESC logic
        }
        event.stopImmediatePropagation();
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose, selectedTask, isModalOpen, isEditing]);

  const p = projectDetails || projectSummary;

  // Populate Edit Form
  const handleStartEdit = () => {
    setEditFormData({
      title: p.title || '',
      description: p.description || '',
      priority: p.priority ?? 0,
      assignee: p.assignee || 'UNKNOWN',
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 16) : '',
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' ? Number(value) : value,
    }));
  };

  // Submit Project Updates
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim() || null,
        priority: editFormData.priority,
        assignee: editFormData.assignee.trim() || 'UNKNOWN',
        deadline: editFormData.deadline ? new Date(editFormData.deadline).toISOString() : null,
      };

      const updatedData = await updateProject(p.id, payload);
      setProjectDetails(updatedData);
      setIsEditing(false);
      if (onProjectUpdated) onProjectUpdated(updatedData);
    } catch (err) {
      console.error("Failed to update project:", err);
      setError("FAILED TO UPDATE PROJECT TELEMETRY");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Project Deletion
  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to delete project PRJ-0${p.id}? This will remove all associated telemetry.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteProject(p.id);
      if (onProjectDeleted) onProjectDeleted(p.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError("FAILED TO DELETE PROJECT ENTITY");
      setIsSubmitting(false);
    }
  };

  // Handler for dynamic task addition
  const handleTaskCreated = (newTask) => {
    if (newTask) {
      setProjectDetails((prev) => {
        if (!prev) return prev;
        const currentTasks = prev.tasks || [];
        return {
          ...prev,
          tasks: [newTask, ...currentTasks],
        };
      });
    }
    setIsModalOpen(false);
  };

  // Handlers for task mutation inside child drawer
  const handleTaskUpdated = (updatedTask) => {
    setProjectDetails((prev) => {
      if (!prev || !prev.tasks) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      };
    });
  };

  const handleTaskDeleted = (taskId) => {
    setProjectDetails((prev) => {
      if (!prev || !prev.tasks) return prev;
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      };
    });
    setSelectedTask(null);
  };

  const PROJECT_STATES = ["Not Started", "Backlog", "In Progress", "Blocked", "Completed", "Cancel"];

  const handleStateChange = async (newState) => {
    try {
      const updated = await updateProjectState(p.id, newState);
      setProjectDetails(updated);
      if (onProjectUpdated) onProjectUpdated(updated);
    } catch (err) {
      console.error("Failed to transition project state:", err);
    }
  };

  const handleAddProjectTag = async (tagName) => {
    const updatedProject = await assignTagToProject(p.id, tagName);
    setProjectDetails(updatedProject);
    if (onProjectUpdated) onProjectUpdated(updatedProject);
  };

  const handleDeleteProjectTag = async (tagName) => {
    // Optimistically remove tag locally or trigger API delete
    setProjectDetails((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => (typeof t === 'string' ? t !== tagName : t.name !== tagName)),
    }));
  };

  return (
    <div className="relative flex flex-col h-full w-full p-6 font-mono text-gray-200 bg-[#121212] overflow-hidden">
      {/* Header Bar */}
      <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-[#00ffaa] border border-[#00ffaa]/30 px-1.5 py-0.5 rounded bg-[#00ffaa]/10">
              PRJ-0{p.id}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              STATE: {p.state || p.status || 'ACTIVE'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-gray-100">
            {p.title || 'UNNAMED PROJECT'}
          </h2>
        </div>
        <select
          value={p.state || 'BACKLOG'}
          onChange={(e) => handleStateChange(e.target.value)}
          className="text-[10px] bg-[#1a1a1a] border border-gray-800 text-[#00ffaa] font-semibold px-2 py-0.5 rounded focus:outline-none cursor-pointer uppercase"
        >
          {PROJECT_STATES.map((state) => (
            <option key={state} value={state} className="bg-[#121212] text-gray-200">
              {state.replace('_', ' ')}
            </option>
          ))}
        </select>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-[#00ffaa] text-lg px-3 py-1 border border-gray-800 hover:border-[#00ffaa] rounded transition-colors"
          title="Close (ESC)"
        >
          ✕
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-[#00ffaa] animate-pulse">
          FETCHING HEAVY TELEMETRY PAYLOAD...
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xs text-red-400 border border-red-900/50 p-4 rounded bg-red-950/20 text-center max-w-md">
            {error}
          </div>
        </div>
      ) : isEditing ? (
        /* Edit Project Form Mode */
        <div className="flex-1 overflow-y-auto max-w-3xl">
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs bg-[#1a1a1a] p-6 rounded border border-gray-800">
            <span className="text-[10px] text-[#00ffaa] tracking-widest uppercase block mb-4">
              // EDIT SUBSYSTEM CONFIGURATION
            </span>

            <div>
              <label className="block text-gray-400 uppercase tracking-wider mb-1">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
                className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa]"
              />
            </div>

            <div>
              <label className="block text-gray-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={editFormData.description}
                onChange={handleEditChange}
                className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={editFormData.priority}
                  onChange={handleEditChange}
                  className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa]"
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
                  value={editFormData.assignee}
                  onChange={handleEditChange}
                  className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 uppercase tracking-wider mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={editFormData.deadline}
                onChange={handleEditChange}
                className="w-full bg-[#121212] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] color-scheme-dark"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-800 text-gray-400 hover:text-gray-200 rounded transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#00ffaa]/10 border border-[#00ffaa]/50 text-[#00ffaa] rounded font-semibold hover:bg-[#00ffaa]/20 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'SAVING...' : 'UPDATE SUBSYSTEM'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Display Overview Layout */
        <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 pr-2">

          {/* LEFT PANEL: Project Metadata & Overview */}
          <div className="lg:col-span-7 lg:overflow-y-auto lg:pr-4 space-y-6">
            <div className="bg-[#1a1a1a] p-5 rounded border border-gray-800/80">
              <span className="text-[10px] text-gray-500 tracking-widest uppercase block mb-2">
                // OVERVIEW & DESCRIPTION
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">
                {p.description || 'No descriptive payload provided for this subsystem.'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                <span className="text-[9px] text-gray-500 block mb-1">ASSIGNER</span>
                <span className="text-gray-200 font-semibold">{p.assigner || 'N/A'}</span>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                <span className="text-[9px] text-gray-500 block mb-1">ASSIGNEE</span>
                <span className="text-gray-200 font-semibold">{p.assignee || 'UNASSIGNED'}</span>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                <span className="text-[9px] text-gray-500 block mb-1">PRIORITY LEVEL</span>
                <span className="text-[#00ffaa] font-semibold">{p.priority ?? 'N/A'}</span>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                <span className="text-[9px] text-gray-500 block mb-1">DEADLINE</span>
                <span className="text-gray-200 font-semibold">
                  {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'NO DEADLINE'}
                </span>
              </div>
            </div>

            {p.tags && p.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 tracking-widest uppercase block">
                  // METADATA TAGS
                </span>
                <div className="flex flex-wrap gap-2">
                  <TagManager
                    tags={p.tags || []}
                    onAddTag={handleAddProjectTag}
                    onDeleteTag={handleDeleteProjectTag}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Attached Task Subsystems */}
          <div className="lg:col-span-5 lg:overflow-y-auto lg:pl-2 flex flex-col space-y-3">
            <div className="flex justify-between items-center sticky top-0 bg-[#121212] py-1 z-10">
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                // ATTACHED TASKS ({p.tasks?.length || 0})
              </span>
            </div>

            {p.tasks && p.tasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 max-w-5xl">
                {p.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-[#1a1a1a] rounded border border-gray-800 text-center text-xs text-gray-500">
                NO ATTACHED TASKS FOUND FOR THIS SUBSYSTEM
              </div>
            )}
          </div>

        </div>
      )}

      {/* Left-Side Task Slide-over Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-2xl bg-[#121212] z-40 transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-gray-800 ${selectedTask ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {selectedTask && (
          <SingleTaskDisplay
            taskSummary={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        )}
      </div>

      {/* Create Task Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
            <CreateTaskForm
              projectId={p.id}
              onSuccess={handleTaskCreated}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="border-t border-gray-800 pt-4 mt-4 flex justify-between items-center shrink-0">
        <span className="text-[10px] text-gray-600">PRESS ESC TO DISMISS</span>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 text-xs font-semibold text-[#eeff00] bg-[#eeff00]/10 border border-[#eeff00]/40 hover:bg-[#eeff00]/20 rounded transition-colors"
              >
                EDIT PROJECT
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-900/50 hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
              >
                DELETE PROJECT
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/40 hover:bg-[#00ffaa]/20 rounded transition-colors"
              >
                + ADD TASK
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-300 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            CLOSE PANEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProjectDisplay;