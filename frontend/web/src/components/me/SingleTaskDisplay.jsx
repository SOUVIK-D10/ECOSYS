import React, { useState, useEffect, useRef } from 'react';
import { fetchTaskById, updateTask, deleteTask, updateTaskState, assignTagToTask } from '../../hooks/api.js';
import {TagManager} from './TagManager.jsx';

const PRIORITY_OPTIONS = [
    { label: 'UNIDENTIFIED (0)', value: 0 },
    { label: 'LOW (1)', value: 1 },
    { label: 'MEDIUM (2)', value: 2 },
    { label: 'HIGH (3)', value: 3 },
    { label: 'CRITICAL (4)', value: 4 },
];

const TASK_STATES = ["Not Started", "Backlog", "In Progress", "Blocked", "Completed", "Cancel"];

const SingleTaskDisplay = ({ taskSummary, onClose, onTaskUpdated, onTaskDeleted }) => {
    const [taskDetails, setTaskDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        priority: 0,
        assignee: '',
        deadline: '',
    });

    const containerRef = useRef(null);

    // Auto-focus panel on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    // Load detailed task telemetry
    useEffect(() => {
        let isMounted = true;
        const loadDetails = async () => {
            if (!taskSummary?.id) return;
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchTaskById(taskSummary.id);
                if (isMounted) {
                    setTaskDetails(data);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching task details:", err);
                    setError("FAILED TO FETCH TASK TELEMETRY");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        if (taskSummary?.id) {
            loadDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [taskSummary]);

    const t = taskDetails || taskSummary;

    // Populate edit form when entering edit mode
    const handleStartEdit = () => {
        setEditFormData({
            title: t.title || '',
            description: t.description || '',
            priority: t.priority ?? 0,
            assignee: t.assignee || 'UNKNOWN',
            deadline: t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : '',
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

    // Submit Task Updates
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
                project_id: t.project_id || null,
            };

            const updatedData = await updateTask(t.id, payload);
            setTaskDetails(updatedData);
            setIsEditing(false);
            if (onTaskUpdated) onTaskUpdated(updatedData);
        } catch (err) {
            console.error("Failed to update task:", err);
            setError("FAILED TO UPDATE TASK ENTITY");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Task Deletion
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete task TSK-0${t.id}?`)) {
            return;
        }

        try {
            setIsSubmitting(true);
            await deleteTask(t.id);
            if (onTaskDeleted) onTaskDeleted(t.id);
            onClose();
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError("FAILED TO DELETE TASK ENTITY");
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            if (isEditing) {
                setIsEditing(false);
            } else {
                onClose();
            }
        }
    };

    const handleTaskStateChange = async (newState) => {
        try {
            const updated = await updateTaskState(t.id, newState);
            setTaskDetails(updated);
            if (onTaskUpdated) onTaskUpdated(updated);
        } catch (err) {
            console.error("Failed to transition task state:", err);
        }
    };

    const handleAddTaskTag = async (tagName) => {
        const updatedTask = await assignTagToTask(t.id, tagName);
        setTaskDetails(updatedTask);
        if (onTaskUpdated) onTaskUpdated(updatedTask);
    };

    const handleDeleteTaskTag = async (tagName) => {
        // Optimistically remove tag locally or trigger API delete
        setTaskDetails((prev) => ({
            ...prev,
            tags: (prev.tags || []).filter((tag) => (typeof tag === 'string' ? tag !== tagName : tag.name !== tagName)),
        }));
    };

    return (
        <div
            ref={containerRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="flex flex-col h-full p-6 font-mono text-gray-200 bg-[#121212] outline-none"
        >
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-[#00ffaa] border border-[#00ffaa]/30 px-1.5 py-0.5 rounded bg-[#00ffaa]/10">
                            TSK-0{t.id}
                        </span>
                        {t.project_id && (
                            <span className="text-[10px] text-gray-400 border border-gray-800 px-1.5 py-0.5 rounded bg-[#1a1a1a]">
                                PRJ-0{t.project_id}
                            </span>
                        )}
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                            STATE: {t.state || t.status || 'PENDING'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-wider text-gray-100">
                        {t.title || 'UNNAMED TASK'}
                    </h2>
                    <select
                        value={t.state || 'TODO'}
                        onChange={(e) => handleTaskStateChange(e.target.value)}
                        className="text-[10px] bg-[#1a1a1a] border border-gray-800 text-[#00ffaa] font-semibold px-2 py-0.5 rounded focus:outline-none cursor-pointer uppercase"
                    >
                        {TASK_STATES.map((state) => (
                            <option key={state} value={state} className="bg-[#121212] text-gray-200">
                                {state.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-[#00ffaa] text-lg px-2 py-1 border border-gray-800 hover:border-[#00ffaa] rounded transition-colors"
                    title="Close (ESC)"
                >
                    ✕
                </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {isLoading ? (
                    <div className="text-xs text-[#00ffaa] animate-pulse py-8 text-center">
                        FETCHING TASK TELEMETRY STREAMS...
                    </div>
                ) : error ? (
                    <div className="text-xs text-red-400 border border-red-900/50 p-4 rounded bg-red-950/20 text-center">
                        {error}
                    </div>
                ) : isEditing ? (
                    /* Edit Form Mode */
                    <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                        <div>
                            <label className="block text-gray-400 uppercase tracking-wider mb-1">
                                Task Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={editFormData.title}
                                onChange={handleEditChange}
                                required
                                className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa]"
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
                                className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-gray-400 uppercase tracking-wider mb-1">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={editFormData.priority}
                                    onChange={handleEditChange}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa]"
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
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa]"
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
                                className="w-full bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-[#00ffaa] color-scheme-dark"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 border border-gray-800 text-gray-400 hover:text-gray-200 rounded"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-1.5 bg-[#00ffaa]/10 border border-[#00ffaa]/50 text-[#00ffaa] rounded font-semibold hover:bg-[#00ffaa]/20 disabled:opacity-50"
                            >
                                {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Normal Display Mode */
                    <>
                        <div className="bg-[#1a1a1a] p-4 rounded border border-gray-800/80">
                            <span className="text-[10px] text-gray-500 tracking-widest uppercase block mb-2">
                                // TASK DESCRIPTION & INSTRUCTIONS
                            </span>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                {t.description || 'No descriptive payload provided for this task.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                                <span className="text-[9px] text-gray-500 block mb-1">ASSIGNER</span>
                                <span className="text-gray-200 font-semibold">{t.assigner || 'N/A'}</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                                <span className="text-[9px] text-gray-500 block mb-1">ASSIGNEE</span>
                                <span className="text-gray-200 font-semibold">{t.assignee || 'UNASSIGNED'}</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                                <span className="text-[9px] text-gray-500 block mb-1">PRIORITY LEVEL</span>
                                <span className="text-[#00ffaa] font-semibold">{t.priority ?? 'N/A'}</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                                <span className="text-[9px] text-gray-500 block mb-1">ASSIGNED ON</span>
                                <span className="text-gray-200 font-semibold">
                                    {t.assigned_on ? new Date(t.assigned_on).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800 col-span-2 md:col-span-1">
                                <span className="text-[9px] text-gray-500 block mb-1">DEADLINE</span>
                                <span className="text-gray-200 font-semibold">
                                    {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'NO DEADLINE'}
                                </span>
                            </div>
                        </div>

                        {t.tags && t.tags.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[10px] text-gray-500 tracking-widest uppercase block">
                                    // METADATA TAGS
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <TagManager
                                        tags={t.tags || []}
                                        onAddTag={handleAddTaskTag}
                                        onDeleteTag={handleDeleteTaskTag}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-800 pt-4 mt-auto flex justify-between items-center shrink-0">
                <span className="text-[10px] text-gray-600">PRESS ESC TO DISMISS</span>
                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <button
                                onClick={handleStartEdit}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-xs font-semibold text-[#eeff00] bg-[#eeff00]/10 border border-[#eeff00]/40 hover:bg-[#eeff00]/20 rounded transition-colors"
                            >
                                EDIT TASK
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-900/50 hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                            >
                                DELETE TASK
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/40 hover:bg-[#00ffaa]/20 rounded transition-colors"
                    >
                        CLOSE PANEL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SingleTaskDisplay;