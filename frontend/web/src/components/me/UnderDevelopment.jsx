import React from 'react';

export default function UnderDevelopment({ title = "MODULE INACTIVE", code = "SYS.DEV" }) {
  return (
    <div className="h-full w-full bg-[#1a1a1a] text-gray-100 font-mono p-8 flex flex-col justify-between select-none overflow-hidden">
      
      {/* HEADER BAR */}
      <div className="border-b border-gray-800 pb-4">
        <span className="text-xs text-[#00ffaa] tracking-widest uppercase">Status // Construction</span>
        <h1 className="text-2xl font-bold tracking-[0.2em]">{title}</h1>
      </div>

      {/* CENTER WORK-IN-PROGRESS DISPLAY */}
      <div className="flex-1 flex flex-col items-center justify-center my-8">
        <div className="relative p-8 border border-gray-800 bg-[#121212]/80 rounded-lg max-w-md w-full flex flex-col items-center text-center backdrop-blur-md shadow-2xl">
          
          {/* OPTIMIZED INLINE HUD GRAPHIC */}
          <div className="relative mb-6 flex items-center justify-center">
            <svg
              className="w-24 h-24 text-[#00ffaa] animate-pulse"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {/* Outer Tactical Ring */}
              <circle cx="50" cy="50" r="45" strokeDasharray="4 4" opacity="0.4" />
              <circle cx="50" cy="50" r="38" opacity="0.2" />

              {/* Construction Wrench & Screwdriver Icon */}
              <path
                d="M35 65 L65 35 M65 35 L58 28 M65 35 L72 42"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <path
                d="M35 35 L65 65 M35 35 L42 28 M35 35 L28 42"
                strokeLinecap="round"
                strokeWidth="2.5"
                opacity="0.6"
              />

              {/* HUD Corner Accents */}
              <path d="M10 25 V10 H25" strokeWidth="2" />
              <path d="M75 10 H90 V25" strokeWidth="2" />
              <path d="M90 75 V90 H75" strokeWidth="2" />
              <path d="M25 90 H10 V75" strokeWidth="2" />
            </svg>
          </div>

          {/* CODE BADGE */}
          <span className="text-[10px] tracking-widest text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/30 px-2 py-0.5 rounded mb-3">
            {code} // STAGING
          </span>

          {/* STATUS TEXT */}
          <h2 className="text-sm font-semibold tracking-wider text-gray-200 mb-2">
            FEATURE UNDER DEVELOPMENT
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
            This grid subsystem is currently being compiled. Neural pathways and backend integrations will be online soon.
          </p>

          {/* PROGRESS BAR SIMULATION */}
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-6 overflow-hidden border border-gray-700">
            <div className="bg-[#00ffaa] h-full w-2/5 animate-pulse" />
          </div>
          <div className="flex justify-between w-full text-[9px] text-gray-500 mt-1">
            <span>ALLOCATING MEMORY</span>
            <span>40% COMPLETE</span>
          </div>
        </div>
      </div>

      {/* FOOTER DIAGNOSTIC */}
      <div className="border-t border-gray-800 pt-3 flex justify-between items-center text-[10px] text-gray-600">
        <span>O.A.S.I.S CORE COMPILER</span>
        <span className="text-[#00ffaa]/70">STANDBY MODE</span>
      </div>
    </div>
  );
}