import React from 'react';

interface InsigniaProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const BureauInsignia: React.FC<InsigniaProps> = ({ 
  className = '', 
  size = 48,
  showText = false 
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]"
      >
        {/* Outer Brass Ring */}
        <circle cx="50" cy="50" r="46" stroke="#d4af37" strokeWidth="2.5" fill="#141e2e" />
        <circle cx="50" cy="50" r="42" stroke="#8a7322" strokeWidth="1" strokeDasharray="3 2" fill="none" />

        {/* Heraldic Shield */}
        <path 
          d="M50 16 C65 16 75 22 75 42 C75 62 50 82 50 82 C50 82 25 62 25 42 C25 22 35 16 50 16 Z" 
          fill="#1b2838" 
          stroke="#e6c875" 
          strokeWidth="2" 
        />

        {/* Cross / St George & Royal Crest Quartering */}
        <path d="M50 18 L50 80" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M26 44 L74 44" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Crown at Top */}
        <path 
          d="M40 25 L43 32 L50 24 L57 32 L60 25 L58 35 L42 35 Z" 
          fill="#d4af37" 
          stroke="#ffd700" 
          strokeWidth="0.8" 
        />
        <circle cx="50" cy="22" r="1.5" fill="#ffd700" />
        <circle cx="40" cy="23" r="1.2" fill="#ffd700" />
        <circle cx="60" cy="23" r="1.2" fill="#ffd700" />

        {/* Quill & Caliper / Key Symbol inside Shield */}
        <path d="M44 48 L56 60 M56 48 L44 60" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="54" r="4" fill="#8b0000" stroke="#d4af37" strokeWidth="1" />

        {/* Royal Laurel Wreath flanking bottom */}
        <path d="M22 55 C20 68 32 78 48 84" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M78 55 C80 68 68 78 52 84" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-['Cinzel'] font-black tracking-[0.2em] text-[#e6c875] text-sm uppercase leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            The Bureau
          </span>
          <span className="font-['Courier_Prime'] text-[10px] tracking-wider text-[#a0aec0] uppercase font-bold">
            Assessment &amp; Cataloguing
          </span>
        </div>
      )}
    </div>
  );
};
