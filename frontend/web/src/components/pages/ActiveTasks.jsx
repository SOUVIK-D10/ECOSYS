import React, { useState, useEffect } from 'react';
import { TaskCard } from '../me/BasicCard'; 
import { fetchTasks } from '../../hooks/api';
import SingleTaskDisplay from '../me/SingleTaskDisplay'; 

export default function ActiveTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (typeof fetchTasks === 'function') {
          const fetchedTasks = await fetchTasks();
          setTasks(fetchedTasks || []);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
      } //font-mono
      finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const taskList = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="relative h-full w-full bg-[#1a1a1a] text-gray-100 font-mono p-8 overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <span className="text-xs text-[#00ffaa] tracking-widest uppercase">Subsystem // 02</span>
          <h1 className="text-2xl font-bold tracking-[0.2em]">ACTIVE TASKS</h1>
        </div>
        <span className="text-xs text-gray-500">
          QUEUE DEPTH: {taskList.length} OPERATIONAL
        </span>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="text-xs text-[#00ffaa] animate-pulse">
          FETCHING TASK QUEUE...
        </div>
      ) : taskList.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 max-w-5xl">
          {taskList.map((task) => (
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
        <div className="border border-dashed border-gray-800 p-8 rounded text-center max-w-2xl bg-[#121212]/40 my-8">
          <span className="text-xs text-gray-500 tracking-widest">
            NO ACTIVE TASKS IN QUEUE
          </span>
        </div>
      )}

      {/* BACKDROP OVERLAY */}
      {selectedTask && (
        <div
          onClick={() => setSelectedTask(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] bg-[#121212] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          selectedTask ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTask && (
          <SingleTaskDisplay
            taskSummary={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </div>
  );
}