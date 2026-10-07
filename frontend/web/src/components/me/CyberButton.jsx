import React from "react";

export function CyberButton({
  children,
  onClick,
  variant = "cyan",
  className = "",
  ...props
}) {
  const variantStyles = {
    cyan: "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    emerald: "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    rose: "border-rose-500 text-rose-400 hover:bg-rose-500/10 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]",
  };

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center overflow-hidden border px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Background Cyber Grid Accent */}
      <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      
      {/* Corner Brackets */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-current" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-current" />

      {/* Label */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}