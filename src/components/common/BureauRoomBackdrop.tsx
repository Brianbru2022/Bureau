import React from 'react';

interface BackdropProps {
  roomName?: string;
  children: React.ReactNode;
}

export const BureauRoomBackdrop: React.FC<BackdropProps> = ({ roomName = '', children }) => {
  // Select color palette tone based on department
  let headerColor = '#d4af37';
  let ambientGlow = 'rgba(212, 175, 55, 0.08)';

  const safeRoomName = roomName || '';

  if (safeRoomName.includes('Atlas') || safeRoomName.includes('Ordnance')) {
    ambientGlow = 'rgba(56, 178, 172, 0.08)';
    headerColor = '#4fd1c5';
  } else if (safeRoomName.includes('Vault') || safeRoomName.includes('Darkroom') || safeRoomName.includes('Risk') || safeRoomName.includes('Confidence')) {
    ambientGlow = 'rgba(229, 62, 62, 0.08)';
    headerColor = '#feb2b2';
  } else if (safeRoomName.includes('Records') || safeRoomName.includes('Archive') || safeRoomName.includes('Registry')) {
    ambientGlow = 'rgba(214, 158, 46, 0.08)';
    headerColor = '#f6ad55';
  } else if (safeRoomName.includes('Chamber') || safeRoomName.includes('Reconnaissance') || safeRoomName.includes('Statistics')) {
    ambientGlow = 'rgba(159, 122, 234, 0.08)';
    headerColor = '#d6bcfa';
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a101d] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Background Architectural Canvas */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 10%, ${ambientGlow} 0%, transparent 60%),
            radial-gradient(circle at 10% 90%, rgba(20, 30, 48, 0.9) 0%, transparent 50%),
            linear-gradient(to bottom, rgba(14, 23, 36, 0.85), rgba(7, 12, 20, 0.98))
          `
        }}
      />

      {/* Decorative Victorian Brass Filigree Border */}
      <div className="absolute inset-2 sm:inset-4 border border-[#d4af37]/20 pointer-events-none z-10 rounded-lg">
        {/* Corner Brass Brackets */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]" />

        {/* Top Pneumatic Tube Rail */}
        <div className="hidden md:flex absolute top-3 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent items-center justify-center">
          <span className="bg-[#0e1724] px-4 font-['Courier_Prime'] text-[9px] tracking-[0.3em] text-[#d4af37]/60 uppercase">
            Her Majesty's Assessment &amp; Cataloguing Framework
          </span>
        </div>
      </div>

      {/* Atmospheric Scanline & Parchment Grain */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex flex-col w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
        {children}
      </div>
    </div>
  );
};
