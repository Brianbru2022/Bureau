import React from 'react';

interface InsigniaProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const BureauInsignia: React.FC<InsigniaProps> = ({ className = '', size = 48, showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-[0_5px_0_rgba(83,54,34,.25)]">
        <circle cx="50" cy="50" r="46" fill="#f4e6c2" stroke="#7e5c24" strokeWidth="5" />
        <circle cx="50" cy="50" r="39" fill="#2f8f95" stroke="#b7882f" strokeWidth="3" />
        <rect x="28" y="22" width="44" height="56" rx="7" fill="#fff7df" stroke="#7e5c24" strokeWidth="3" />
        <path d="M39 23V77" stroke="#d9644f" strokeWidth="4" />
        <rect x="45" y="31" width="20" height="8" rx="2" fill="#e0a83f" stroke="#7e5c24" strokeWidth="2" />
        <rect x="45" y="46" width="20" height="8" rx="2" fill="#67c4c1" stroke="#7e5c24" strokeWidth="2" />
        <rect x="45" y="61" width="20" height="8" rx="2" fill="#376d9b" stroke="#7e5c24" strokeWidth="2" />
        <path d="M22 57C20 70 32 80 47 84M78 57C80 70 68 80 53 84" stroke="#4f7457" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-['Cinzel'] font-black tracking-[0.09em] text-[#244b55] text-xs uppercase leading-tight">Bureau of Questionable Knowledge</span>
          <span className="font-['Courier_Prime'] text-xs tracking-wider text-[#745d46] uppercase font-bold">Assessment &amp; Cataloguing</span>
        </div>
      )}
    </div>
  );
};
