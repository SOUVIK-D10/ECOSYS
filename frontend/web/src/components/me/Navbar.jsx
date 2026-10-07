import React, { useState } from 'react';
import { useTab } from '../../context/useTab';

const Navbar = ({ activeTab = 'HOME', onSelectTab }) => {
  const { currentTab, setCurrentTab } = useTab();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'HOME', label: 'HOME', code: 'SYS.01', icon: '⌂' },
    { id: 'ACTIVE TASKS', label: 'ACTIVE TASKS', code: 'TSK.02', icon: '⚡' },
    { id: 'PROJECTS', label: 'PROJECTS', code: 'PRJ.03', icon: '◫' },
    { id: 'PLANNING', label: 'PLANNING', code: 'PLN.04', icon: '◈' },
    { id: 'TEAMS', label: 'TEAMS', code: 'TMS.05', icon: '☖' },
    { id: 'SETTINGS', label: 'SETTINGS', code: 'STG.06', icon: '⚙' },
  ];

  const handleTabClick = (id) => {
    setCurrentTab(id);
    if (onSelectTab) onSelectTab(id);
  };

  return (
    <aside
      className={`h-screen bg-[#121212]/95 backdrop-blur-md border-r border-gray-800 font-mono select-none flex flex-col justify-between transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* UPPER SECTION: BRAND & NAVIGATION */}
      <div className="flex flex-col flex-1">
        
        {/* BRAND HEADER */}
        <div className="h-16 px-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
              <div className="w-2 h-2 bg-[#00ffaa] rounded-full animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-base font-bold tracking-[0.2em] text-gray-100">
                  O.A.S.I.S
                </span>
                <span className="text-[9px] tracking-widest text-[#00ffaa] uppercase">
                  Command Grid v1.2
                </span>
              </div>
            )}
          </div>

          {/* TOGGLE SIDEBAR BUTTON */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-[#00ffaa] text-xs p-1 rounded transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? '❯' : '❮'}
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full h-11 px-3 rounded flex items-center gap-3 text-xs font-semibold tracking-wider transition-all duration-200 group relative ${
                  isActive
                    ? 'text-[#00ffaa] bg-[#00ffaa]/10 border-r-2 border-[#00ffaa]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                {/* ICON / INDICATOR */}
                <span className={`text-base flex-shrink-0 w-6 text-center ${
                  isActive ? 'text-[#00ffaa]' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  {item.icon}
                </span>

                {/* TEXT CONTENT (Hidden when collapsed) */}
                {!isCollapsed && (
                  <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
                    <span className={`text-[8px] tracking-normal leading-tight ${
                      isActive ? 'text-[#00ffaa]/70' : 'text-gray-600 group-hover:text-gray-400'
                    }`}>
                      {item.code}
                    </span>
                    <span className="leading-tight">{item.label}</span>
                  </div>
                )}

                {/* GLOW BAR FOR ACTIVE ITEM */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ffaa] shadow-[0_0_8px_#00ffaa]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* LOWER SECTION: SYSTEM DIAGNOSTICS */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/30">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffaa] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffaa]"></span>
          </span>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-[10px] text-gray-500 tracking-wider">NET STATUS</span>
              <span className="text-xs text-[#00ffaa] font-medium tracking-widest">
                ONLINE // 100%
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Navbar;