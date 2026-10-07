import React from 'react';

const getPriorityBadge = (p) => {
    switch (p) {
        case 5: return { label: 'URGENT', style: 'text-red-400 border-red-500/50 bg-red-500/10' };
        case 4: return { label: 'HIGH', style: 'text-amber-400 border-amber-500/50 bg-amber-500/10' };
        case 3: return { label: 'MID-HIGH', style: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' };
        case 2: return { label: 'MID-LOW', style: 'text-blue-400 border-blue-500/50 bg-blue-500/10' };
        case 1: return { label: 'LOW', style: 'text-gray-400 border-gray-600 bg-gray-800' };
        default: return { label: 'UNIDENTIFIED', style: 'text-gray-500 border-gray-700 bg-gray-900' };
    }
};

const TaskCard = ({ task }) => {
    if (!task) return null;

    const priorityBadge = getPriorityBadge(task.priority);
    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'NO DEADLINE';

    return (
        <div className="p-4 bg-[#121212]/80 border border-gray-800 rounded relative overflow-hidden group hover:border-[#00ffaa]/50 transition-colors select-none"
            
            >
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#00ffaa] font-semibold">TSK-0{task.id}</span>
                    <span className="text-[10px] text-gray-500 border border-gray-800 px-1.5 py-0.2 rounded">
                        PRJ-0{task.project_id}
                    </span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded border ${priorityBadge.style}`}>
                    {priorityBadge.label}
                </span>
            </div>

            <h3 className="text-sm font-medium text-gray-200 tracking-wide truncate">{task.title}</h3>

            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800/80 pt-2">
                <span>
                    ASSIGNEE: <span className="text-gray-200">{task.assignee || 'UNASSIGNED'}</span>
                </span>
                <span className="text-[10px] text-gray-500">{formattedDeadline}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                <span>
                    STATUS: <span className="text-[#00ffaa] uppercase">{task.state}</span>
                </span>
                <button className="group-hover:text-[#00ffaa] text-gray-400 transition-colors text-xs">
                    DETAILS ➔
                </button>
            </div>
        </div>
    );
};

const ProjectCard = ({ proj }) => {
    if (!proj) return null; // Safe guard for undefined data during async loads

    const priorityBadge = getPriorityBadge(proj.priority);
    const formattedDeadline = proj.deadline
        ? new Date(proj.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'NO DEADLINE';

    return (
        <div className="p-5 bg-[#121212]/80 border border-gray-800 rounded flex flex-col justify-between h-48 hover:border-[#00ffaa]/50 transition-colors select-none">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-gray-500 tracking-wider">PRJ-0{proj.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 border rounded ${priorityBadge.style}`}>
                        {priorityBadge.label}
                    </span>
                </div>
                <h2 className="text-lg font-bold text-gray-100 tracking-wide truncate">{proj.title}</h2>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <span>ASSIGNEE: <span className="text-gray-200">{proj.assignee || 'UNASSIGNED'}</span></span>
                    <span className="text-[10px] text-gray-500">{formattedDeadline}</span>
                </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                <span className="text-[10px] text-[#00ffaa] tracking-widest uppercase">{proj.state}</span>
                <button className="text-xs text-gray-400 hover:text-white transition-colors">DETAILS ➔</button>
            </div>
        </div>
    );
};

export { TaskCard, ProjectCard };