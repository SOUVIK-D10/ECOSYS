// import React, { useState, useEffect } from 'react';
// import { TaskCard } from '../me/BasicCard'; // Adjust import path as needed
// import { fetchTasks } from '../../hooks/api'; // Adjust to your actual API fetch function

// export default function TaskList() {
//   const [tasks, setTasks] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         if (typeof fetchTasks === 'function') {
//           const fetchedTasks = await fetchTasks();
//           setTasks(fetchedTasks || []);
//         }
//       } catch (error) {
//         console.error('Failed to load tasks:', error);
//         setTasks([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadTasks();
//   }, []);

//   const taskList = Array.isArray(tasks) ? tasks : [];

//   return (
//     <div className="h-full w-full bg-[#1a1a1a] text-gray-100 font-mono p-8 overflow-y-auto">
//       {/* Header */}
//       <div className="border-b border-gray-800 pb-4 mb-6 flex justify-between items-end">
//         <div>
//           <span className="text-xs text-[#00ffaa] tracking-widest uppercase">Subsystem // 02</span>
//           <h1 className="text-2xl font-bold tracking-[0.2em]">ACTIVE TASKS</h1>
//         </div>
//         <span className="text-xs text-gray-500">
//           QUEUE DEPTH: {taskList.length} OPERATIONAL
//         </span>
//       </div>

//       {/* Task Grid */}
//       {isLoading ? (
//         <div className="text-xs text-[#00ffaa] animate-pulse">
//           FETCHING TASK QUEUE...
//         </div>
//       ) : taskList.length > 0 ? (
//         <div className="grid grid-cols-1 gap-4 max-w-5xl">
//           {taskList.map((task) => (
//             <TaskCard key={task.id} task={task} />
//           ))}
//         </div>
//       ) : (
//         <div className="border border-dashed border-gray-800 p-8 rounded text-center max-w-2xl bg-[#121212]/40 my-8">
//           <span className="text-xs text-gray-500 tracking-widest">
//             NO ACTIVE TASKS IN QUEUE
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }