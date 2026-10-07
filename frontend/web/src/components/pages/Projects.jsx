import React, { useState, useEffect } from 'react';
import { ProjectCard } from '../me/BasicCard.jsx';
import { fetchProjects } from '../../hooks/api.js';
import SingleProjectDisplay from '../me/SingleProjectDisplay.jsx';
import CreateProjectForm from '../me/CreateProjectForm.jsx';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const fetchedProjects = await fetchProjects();
        setProjects(fetchedProjects || []);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="relative h-full w-full bg-[#1a1a1a] text-gray-100 font-mono overflow-hidden">
      {/* Scrollable Main Grid */}
      <div className="h-full w-full p-8 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-800 pb-4 mb-6 flex justify-between items-end">
          <div>
            <span className="text-xs text-[#00ffaa] tracking-widest uppercase">Subsystem // 03</span>
            <h1 className="text-2xl font-bold tracking-[0.2em]">PROJECT REGISTRY</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-[#eeff00] bg-[#eeff00]/10 border border-[#eeff00]/40 hover:bg-[#eeff00]/20 rounded transition-colors"
          >
            + ADD NEW PROJECT
          </button>
          <span className="text-xs text-gray-500">
            COUNT: {projects.length} REGISTERED
          </span>
        </div>

        {/* Grid with Loading and Defensive Safety Nets */}
        {isLoading ? (
          <div className="text-xs text-[#00ffaa] animate-pulse">
            FETCHING TELEMETRY STREAMS...
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <ProjectCard proj={proj} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-800 p-8 rounded text-center max-w-2xl bg-[#121212]/40 my-8">
            <span className="text-xs text-gray-500 tracking-widest">
              NO PROJECTS FOUND IN DATABASE
            </span>
          </div>
        )}
      </div>

      {/* MODAL POPUP */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
            <CreateProjectForm
              onSuccess={handleProjectCreated}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* FULL WIDTH SLIDING TACTICAL DRAWER */}
      <div
        className={`absolute top-0 right-0 h-full w-full bg-[#121212] z-50 transform transition-transform duration-300 ease-in-out ${
          selectedProject ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedProject && (
          <SingleProjectDisplay
            projectSummary={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </div>
  );
}