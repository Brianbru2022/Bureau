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
        <path d="M50 19 C65 19 74 25 74 42 C74 61 50 79 50 79 C50 79 26 61 26 42 C26 25 35 19 50 19Z" fill="#fff7df" stroke="#7e5c24" strokeWidth="3" />
        <path d="M50 21V77M28 45H72" stroke="#d9644f" strokeWidth="4" opacity="0.95" />
        <path d="M38 27L42 35L50 25L58 35L62 27L60 38H40L38 27Z" fill="#e0a83f" stroke="#7e5c24" strokeWidth="2" />
        <path d="M39 52L58 66M60 51L42 68" stroke="#376d9b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="59" r="6" fill="#d9644f" stroke="#7e5c24" strokeWidth="2" />
        <path d="M22 57C20 70 32 80 47 84M78 57C80 70 68 80 53 84" stroke="#4f7457" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-['Cinzel'] font-black tracking-[0.16em] text-[#244b55] text-sm uppercase leading-tight">The Bureau</span>
          <span className="font-['Courier_Prime'] text-[9px] tracking-wider text-[#745d46] uppercase font-bold">Assessment &amp; Cataloguing</span>
        </div>
      )}
    </div>
  );
};
