import React from 'react';

// --- GlassCard: การ์ดพื้นหลังสไตล์คลีนโมเดิร์น ---
export const GlassCard = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode, 
  className?: string 
}) => (
  <div className={`bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl ${className}`}>
    {children}
  </div>
);

// --- GlassButton: ปุ่มกดสไตล์ร้านอาหารระดับโปรดักชัน ---
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
      relative overflow-hidden transition-all duration-200 border shadow-xs
      ${active 
        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-transparent shadow-orange-500/25 shadow-md' 
        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200/80'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-95'}
      rounded-xl font-semibold ${className}
    `}
  >
    {children}
  </button>
);