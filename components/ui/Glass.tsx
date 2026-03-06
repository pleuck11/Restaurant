import React from 'react';

// --- GlassCard: การ์ดพื้นหลังแบบกระจก ---
export const GlassCard = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode, 
  className?: string 
}) => (
  <div className={`bg-white/40 backdrop-blur-lg border border-white/50 shadow-xl rounded-2xl ${className}`}>
    {children}
  </div>
);

// --- GlassButton: ปุ่มกดแบบกระจก พร้อมเอฟเฟกต์ Hover ---
export const GlassButton = ({ 
  children, 
  onClick, 
  active, 
  className = "", 
  disabled, 
  type = "button" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  active?: boolean, 
  className?: string, 
  disabled?: boolean, 
  type?: "button" | "submit" 
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden transition-all duration-300 backdrop-blur-md border shadow-lg
      ${active 
        ? 'bg-gradient-to-r from-orange-500/80 to-pink-500/80 text-white border-transparent' 
        : 'bg-white/30 text-slate-700 border-white/40 hover:bg-white/50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}
      rounded-xl font-semibold ${className}
    `}
  >
    {children}
  </button>
);