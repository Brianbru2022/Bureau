import React, { useState } from 'react';

interface GeneratedArtBackdropProps {
  src?: string;
  dim?: number;
  blur?: number;
  animate?: boolean;
}

export const GeneratedArtBackdrop: React.FC<GeneratedArtBackdropProps> = ({
  src,
  dim = 0.22,
  blur = 0,
  animate = true
}) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${animate ? 'bureau-art-drift' : ''}`}
        style={{ filter: blur ? `blur(${blur}px)` : undefined, transform: 'scale(1.035)' }}
      />
      <div className="absolute inset-0" style={{ background: `rgba(247,239,214,${dim})` }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,.28),transparent_38%),linear-gradient(to_bottom,rgba(255,248,224,.03),rgba(63,45,31,.14))]" />
      <div className="bureau-lamp-glow absolute left-[12%] top-[10%] h-24 w-24 rounded-full bg-[#ffd973]/20 blur-2xl" />
      <div className="bureau-lamp-glow bureau-lamp-glow-delay absolute right-[12%] top-[16%] h-20 w-20 rounded-full bg-[#ffe89a]/20 blur-2xl" />
    </div>
  );
};
