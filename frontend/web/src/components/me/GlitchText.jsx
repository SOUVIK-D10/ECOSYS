import React from "react";

export function GlitchText({ text = "", className = "" }) {
  const safeText = String(text ?? "");

  return (
    <div className={`relative inline-block font-mono font-black uppercase tracking-widest ${className}`}>
      {/* Primary Layer */}
      <span className="relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
        {safeText}
      </span>

      {/* Cyberpunk Glitch Shadow Layer 1 */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 -z-10 text-cyan-500 opacity-70 clip-path-glitch-1 animate-pulse select-none"
        style={{ transform: "translate(-2px, 1px)" }}
      >
        {safeText}
      </span>

      {/* Cyberpunk Glitch Shadow Layer 2 */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 -z-10 text-rose-500 opacity-70 clip-path-glitch-2 select-none"
        style={{ transform: "translate(2px, -1px)" }}
      >
        {safeText}
      </span>
    </div>
  );
}