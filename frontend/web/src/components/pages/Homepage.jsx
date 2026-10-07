import React, { useRef, useState, useEffect } from 'react';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import Core3D from '../me/3DCore';

export default function Homepage() {
  const { healthData, connectionStatus } = useSystemHealth('http://localhost:8001/monitor/health');

  // References for measuring exact pixel locations for SVG vector lines
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const topLeftRef = useRef(null);
  const bottomLeftLineRef = useRef(null); // Ref attached strictly to the battery underline
  const topRightRef = useRef(null);
  const middleRightRef = useRef(null);
  const bottomRightRef = useRef(null);

  const [coords, setCoords] = useState(null);

  // Recalculate line coordinates whenever screen resizes or data renders
  useEffect(() => {
    const updateCoords = () => {
      if (!containerRef.current || !coreRef.current) return;

      const c = containerRef.current.getBoundingClientRect();
      const core = coreRef.current.getBoundingClientRect();

      const getPoint = (el) => {
        if (!el) return { x: 0, xRight: 0, yBottom: 0, yCenter: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - c.left,
          xRight: r.right - c.left,
          yBottom: r.bottom - c.top,
          yCenter: r.top + r.height / 2 - c.top
        };
      };

      const coreCenterX = core.left + core.width / 2 - c.left;
      const coreCenterY = core.top + core.height / 2 - c.top;

      setCoords({
        coreX: coreCenterX,
        coreY: coreCenterY,
        topLeft: getPoint(topLeftRef.current),
        bottomLeft: getPoint(bottomLeftLineRef.current),
        topRight: getPoint(topRightRef.current),
        middleRight: getPoint(middleRightRef.current),
        bottomRight: getPoint(bottomRightRef.current)
      });
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [healthData]);

  if (!healthData) {
    return (
      <div className="h-screen w-screen bg-[#121212] text-[#00ffaa] flex items-center justify-center font-mono">
        ESTABLISHING SSE STREAM... [{connectionStatus}]
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] text-gray-100 font-mono overflow-hidden flex flex-col p-8 select-none">
      
      {/* Header Banner */}
      <div className="text-center border-b border-gray-800 pb-4 mb-4 z-10">
        <h1 className="text-2xl font-bold tracking-[0.3em] text-gray-200">O.A.S.I.S</h1>
      </div>

      {/* Main Command Display Container */}
      <div ref={containerRef} className="flex-1 grid grid-cols-12 items-center relative max-w-7xl mx-auto w-full">
        
        {/* --- SVG DYNAMIC VECTOR LAYER --- */}
        {coords && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 stroke-gray-500 stroke-[1.5]">
            {/* Top-Left: Bottom-Right Corner of Div -> Core */}
            <line x1={coords.topLeft.xRight} y1={coords.topLeft.yBottom} x2={coords.coreX - 60} y2={coords.coreY - 40} />

            {/* Bottom-Left: Attached precisely to the rightmost tip of the Battery underline */}
            <line x1={coords.bottomLeft.xRight} y1={coords.bottomLeft.yBottom} x2={coords.coreX - 60} y2={coords.coreY + 40} />

            {/* Top-Right: Core -> Bottom-Left Corner of Div */}
            <line x1={coords.coreX + 60} y1={coords.coreY - 40} x2={coords.topRight.x} y2={coords.topRight.yBottom} />

            {/* Middle-Right: Core -> Bottom-Left Corner of Div */}
            <line x1={coords.coreX + 80} y1={coords.coreY} x2={coords.middleRight.x} y2={coords.middleRight.yBottom} />

            {/* Bottom-Right: Core -> Bottom-Left Corner of Div */}
            <line x1={coords.coreX + 60} y1={coords.coreY + 40} x2={coords.bottomRight.x} y2={coords.bottomRight.yBottom} />
          </svg>
        )}

        {/* --- LEFT SIDE METRICS --- */}
        <div className="col-span-4 flex flex-col justify-between h-[450px] pr-8 z-10">
          
          {/* Top-Left: UP Time */}
          <div ref={topLeftRef} className="relative pb-2 border-b border-gray-600 mb-2">
            <div className="flex justify-between items-baseline pb-1">
              <span className="text-sm font-semibold tracking-wide">UP time</span>
              <span className="text-lg text-gray-300 font-medium">{healthData.uptime}</span> 
            </div>
          </div>

          {/* Bottom-Left: Battery Life & Plug Status */}
          <div className="relative mt-auto">
            <div className="text-sm font-semibold mb-3">Battery Life</div>
            {/* Ref attached directly to the underline container */}
            <div ref={bottomLeftLineRef} className="flex items-center gap-3 pb-2 border-b border-gray-600">
              
              {/* Segmented Color Bar */}
              <div className="flex h-5 w-40 bg-gray-800 rounded-sm overflow-hidden p-[2px] border border-gray-700">
                <div className="h-full bg-[#ff2222] w-1/3 mr-[1px]" />
                <div className="h-full bg-[#ffaa00] w-1/3 mr-[1px]" />
                <div 
                  className="h-full bg-[#00ffaa] transition-all duration-300" 
                  style={{ width: `${Math.max(0, (healthData.battery_life_percentage - 66.6) * 3)}%` }}
                />
              </div>

              {/* Readout */}
              <span className="text-sm text-gray-300">
                {healthData.battery_life_percentage.toFixed(0)}%
              </span>

              {/* Power Plug Icon */}
              {healthData.battery_is_power_plugged && (
                <svg className="w-6 h-6 text-gray-200 fill-current" viewBox="0 0 24 24">
                  <path d="M16 7V3h-2v4h-4V3H8v4H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V7h-2zm-4 11c-2.21 0-4-1.79-4-4v-5h8v5c0 2.21-1.79 4-4 4z"/>
                </svg>
              )}
            </div>
          </div>

        </div>

        {/* --- CENTER: SOLID 3D CORE --- */}
        <div ref={coreRef} className="col-span-4 h-[450px] w-full flex items-center justify-center z-10">
          <Core3D 
            cpuUsage={healthData.cpu_usage_percent} 
            status={healthData.status}
            isPlugged={healthData.battery_is_power_plugged}
          />
        </div>

        {/* --- RIGHT SIDE METRICS --- */}
        <div className="col-span-4 flex flex-col justify-between h-[450px] pl-8 z-10">
          
          {/* Top-Right: CPU Usage */}
          <div ref={topRightRef} className="relative pb-2 border-b border-gray-600 mb-2">
            <div className="flex justify-between items-baseline pb-1">
              <span className="text-sm font-semibold tracking-wide">CPU Usage</span>
              <span className="text-lg text-gray-300 font-medium">{healthData.cpu_usage_percent.toFixed(1)}%</span>
            </div>
          </div>

          {/* Middle-Right: Storage Allocated / Remaining */}
          <div ref={middleRightRef} className="relative my-auto pb-2 border-b border-gray-600">
            <div className="flex justify-between items-baseline pb-1">
              <span className="text-sm font-semibold tracking-wide">Storage Allocated/Remaining</span>
              <span className="text-sm text-gray-300">
                {healthData.disk_free_gb.toFixed(1)} GB Free ({healthData.disk_usage_percent.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Bottom-Right: Memory Allocated */}
          <div ref={bottomRightRef} className="relative pb-2 border-b border-gray-600">
            <div className="flex justify-between items-baseline pb-1">
              <span className="text-sm font-semibold tracking-wide">MEMORY ALLOCATED</span>
              <span className="text-sm text-gray-300">
                {healthData.ram_usage_percent.toFixed(1)}% ({healthData.ram_left_gb.toFixed(1)} GB Free)
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}